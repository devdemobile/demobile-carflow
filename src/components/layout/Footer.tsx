
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="hidden md:block bg-background border-t border-border py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <p>&copy; 2024 CarFlow. Todos os direitos reservados.</p>
          <p>Sistema de Gerenciamento de Frota</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
