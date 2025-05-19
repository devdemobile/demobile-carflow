
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Car, List, MapPin } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6 pb-16 md:pb-6">
        <h1 className="text-3xl font-bold mb-6">Bem-vindo ao CarFlow</h1>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Gerenciamento de Frota Simplificado</h2>
            <p className="text-muted-foreground mb-4">
              Utilize o menu lateral ou os botões abaixo para navegar pelo sistema.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Car className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-medium">Gerenciar Veículos</h3>
                  <p className="text-sm text-muted-foreground">Cadastre e gerencie seu inventário de veículos</p>
                </CardContent>
              </Card>
              
              <Card className="bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <List className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-medium">Movimentações</h3>
                  <p className="text-sm text-muted-foreground">Controle entradas e saídas de veículos</p>
                </CardContent>
              </Card>
              
              <Card className="bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <MapPin className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-medium">Unidades</h3>
                  <p className="text-sm text-muted-foreground">Gerencie suas unidades e locais</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
