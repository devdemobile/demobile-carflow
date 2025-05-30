
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import MobileNavbar from './MobileNavbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header isMobile={isMobile} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      {isMobile && user && <MobileNavbar />}
    </div>
  );
};

export default Layout;
