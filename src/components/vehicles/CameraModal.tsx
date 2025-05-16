
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Camera, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Inicializa a câmera quando o modal é aberto
  useEffect(() => {
    if (isOpen && !stream) {
      const startCamera = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' }, // Usa a câmera traseira se disponível
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
          
          setStream(mediaStream);
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err) {
          console.error('Erro ao acessar câmera:', err);
          setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
          toast.error('Não foi possível acessar a câmera');
        }
      };
      
      startCamera();
    }
    
    // Limpa o stream quando o componente é desmontado ou o modal é fechado
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setCapturedImage(null);
      }
    };
  }, [isOpen, stream]);

  // Captura a imagem da câmera
  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Define as dimensões do canvas para corresponder ao vídeo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Desenha o frame atual do vídeo no canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Converte o canvas para uma URL de dados
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
      }
    }
  }, []);

  // Confirma a captura da imagem
  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  // Retoma a captura de imagem (descarta a captura atual)
  const retakeImage = useCallback(() => {
    setCapturedImage(null);
  }, []);

  // Fecha o modal e limpa o estado
  const handleClose = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setError(null);
    onClose();
  }, [stream, onClose]);

  // Renderiza o conteúdo do modal de câmera
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">
            {capturedImage ? 'Confirmar Foto' : 'Capturar Foto do Veículo'}
          </h2>
          
          {error ? (
            <div className="text-center p-4">
              <p className="text-red-500">{error}</p>
              <Button variant="outline" onClick={handleClose} className="mt-4">
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <div className="relative w-full bg-black rounded-md overflow-hidden">
                {!capturedImage ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-[300px] object-contain"
                  />
                ) : (
                  <img 
                    src={capturedImage} 
                    alt="Foto capturada" 
                    className="w-full h-[300px] object-contain"
                  />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="flex justify-center gap-4 mt-4">
                {!capturedImage ? (
                  <>
                    <Button variant="outline" onClick={handleClose} className="flex items-center">
                      <X className="mr-2 h-4 w-4" /> Cancelar
                    </Button>
                    <Button onClick={captureImage} className="flex items-center">
                      <Camera className="mr-2 h-4 w-4" /> Capturar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={retakeImage} className="flex items-center">
                      <Camera className="mr-2 h-4 w-4" /> Tirar Novamente
                    </Button>
                    <Button onClick={confirmCapture} className="flex items-center">
                      <Check className="mr-2 h-4 w-4" /> Confirmar
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraModal;
