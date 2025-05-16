
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useIsMobile } from '@/hooks/use-mobile';

const Vehicles = () => {
  const isMobile = useIsMobile();
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Veículos</h1>
        <p>Página de gerenciamento de veículos em construção.</p>
      </div>
    </Layout>
  );
};

export default Vehicles;
