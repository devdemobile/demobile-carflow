
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import { Car, LayoutDashboard, List, User, MapPin } from "lucide-react";

const MobileNavbar = () => {
  const { user, userPermissions } = useAuth();
  const location = useLocation();
  
  if (!user) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t md:hidden">
      <div className="flex items-center justify-around p-2">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center p-2 rounded-md ${
            location.pathname === "/" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        
        <Link 
          to="/movements" 
          className={`flex flex-col items-center justify-center p-2 rounded-md ${
            location.pathname === "/movements" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <List className="h-5 w-5" />
          <span className="text-xs mt-1">Movimentos</span>
        </Link>
        
        {userPermissions?.canViewVehicles && (
          <Link 
            to="/vehicles" 
            className={`flex flex-col items-center justify-center p-2 rounded-md ${
              location.pathname === "/vehicles" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Car className="h-5 w-5" />
            <span className="text-xs mt-1">Veículos</span>
          </Link>
        )}
        
        {userPermissions?.canViewVehicles && (
          <Link 
            to="/units" 
            className={`flex flex-col items-center justify-center p-2 rounded-md ${
              location.pathname === "/units" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <MapPin className="h-5 w-5" />
            <span className="text-xs mt-1">Unidades</span>
          </Link>
        )}
        
        {userPermissions?.canViewUsers && (
          <Link 
            to="/users" 
            className={`flex flex-col items-center justify-center p-2 rounded-md ${
              location.pathname === "/users" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Usuários</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default MobileNavbar;
