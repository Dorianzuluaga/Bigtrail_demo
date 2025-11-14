import React from 'react';
import { Bell, Wallet, Settings, User, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import bigtrailLogo from '@/assets/bigtrail-logo.png';

interface HeaderProps {
  userType?: string;
}

const Header = ({ userType }: HeaderProps) => {
  const navigate = useNavigate();
  const [walletConnected, setWalletConnected] = React.useState(false);
  const [walletAddress, setWalletAddress] = React.useState('');

  const connectWallet = async () => {
    try {
      if (typeof (window as any).ethereum !== 'undefined') {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
      } else {
        alert('Por favor instala MetaMask');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Button>
          <img 
            src={bigtrailLogo} 
            alt="BigTrail Logo" 
            className="h-10 w-auto"
          />
          <div>
            <h1 className="text-xl font-bold bg-adventure-gradient bg-clip-text text-transparent">
              BigTrail {userType ? `- ${userType}` : 'Dashboard'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {userType ? `Panel de ${userType}` : 'Airdrop Analytics Platform'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Nuevo Airdrop disponible</p>
                  <p className="text-xs text-muted-foreground">
                    100 BTM disponibles en Centro Histórico
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Campaña completada</p>
                  <p className="text-xs text-muted-foreground">
                    Has ganado 75 BTM en Parque Central
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Nueva zona activada</p>
                  <p className="text-xs text-muted-foreground">
                    Plaza Mayor ahora disponible
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Wallet Connection */}
          {!walletConnected ? (
            <Button 
              onClick={connectWallet}
              className="btn-adventure"
              size="sm"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Conectar Wallet
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="px-3 py-1">
                <Wallet className="h-3 w-3 mr-1" />
                {formatAddress(walletAddress)}
              </Badge>
            </div>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;