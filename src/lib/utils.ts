
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMileage(mileage: number | string | undefined): string {
  if (mileage === undefined) return '0';
  
  const mileageNum = typeof mileage === 'string' ? parseInt(mileage.replace(/\D/g, '')) : mileage;
  
  if (isNaN(mileageNum)) return '0';
  
  return mileageNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseMileage(mileageStr: string): number {
  // Remove qualquer caracter que não seja número
  const cleanedValue = mileageStr.replace(/\D/g, '');
  
  // Converte para número
  return cleanedValue ? parseInt(cleanedValue, 10) : 0;
}

/**
 * Formata uma data no formato yyyy-MM-dd para dd/MM/yyyy
 */
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) return "";
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "";
  }
}

/**
 * Formata uma hora no formato HH:mm:ss para HH:mm
 */
export function formatTimeForDisplay(timeString: string | undefined): string {
  if (!timeString) return "";
  
  try {
    // Se for apenas HH:mm:ss sem data
    if (timeString.includes(':') && !timeString.includes('T')) {
      const timeParts = timeString.split(':');
      return `${timeParts[0]}:${timeParts[1]}`;
    }
    
    // Se for um formato ISO completo ou com data
    const date = new Date(`2000-01-01T${timeString}`);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) return "";
    
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error("Erro ao formatar hora:", error);
    return "";
  }
}
