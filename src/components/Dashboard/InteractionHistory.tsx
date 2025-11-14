import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  MapPin, 
  Coins, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react';

interface Interaction {
  id: string;
  type: 'airdrop' | 'campaign' | 'check-in' | 'reward';
  title: string;
  location: string;
  brand: string;
  brandLogo?: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description: string;
  transactionHash?: string;
}

const InteractionHistory = () => {
  const interactions: Interaction[] = [
    {
      id: '1',
      type: 'airdrop',
      title: 'Centro Comercial Explorer',
      location: 'Centro Histórico',
      brand: 'Nike',
      amount: 100,
      currency: 'BTM',
      status: 'completed',
      timestamp: '2024-07-28T14:30:00',
      description: 'Airdrop completado - Permanencia 10 minutos',
      transactionHash: '0x1234...5678'
    },
    {
      id: '2',
      type: 'campaign',
      title: 'Aventura Urbana',
      location: 'Parque Central',
      brand: 'BigTrail',
      amount: 75,
      currency: 'BTM',
      status: 'completed',
      timestamp: '2024-07-28T12:15:00',
      description: 'Campaña publicitaria - Foto compartida',
      transactionHash: '0xabcd...efgh'
    },
    {
      id: '3',
      type: 'check-in',
      title: 'Plaza Digital',
      location: 'Plaza Mayor',
      brand: 'Adidas',
      amount: 50,
      currency: 'BTM',
      status: 'pending',
      timestamp: '2024-07-28T10:45:00',
      description: 'Check-in realizado - Esperando validación'
    },
    {
      id: '4',
      type: 'reward',
      title: 'Bonus Semanal',
      location: 'Sistema',
      brand: 'BigTrail',
      amount: 200,
      currency: 'BTM',
      status: 'completed',
      timestamp: '2024-07-27T18:00:00',
      description: 'Recompensa por actividad semanal',
      transactionHash: '0x9876...5432'
    },
    {
      id: '5',
      type: 'airdrop',
      title: 'Zona Expirada',
      location: 'Centro Norte',
      brand: 'Puma',
      amount: 25,
      currency: 'BTM',
      status: 'failed',
      timestamp: '2024-07-27T16:20:00',
      description: 'Tiempo límite excedido'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'airdrop':
        return <MapPin className="h-4 w-4 text-primary" />;
      case 'campaign':
        return <TrendingUp className="h-4 w-4 text-accent" />;
      case 'check-in':
        return <Calendar className="h-4 w-4 text-warning" />;
      case 'reward':
        return <Coins className="h-4 w-4 text-success" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short' 
      }),
      time: date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const totalEarned = interactions
    .filter(i => i.status === 'completed')
    .reduce((sum, i) => sum + i.amount, 0);

  const pendingAmount = interactions
    .filter(i => i.status === 'pending')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Historial de Interacciones</h2>
          <p className="text-muted-foreground">
            Todas tus actividades y recompensas
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtrar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-adventure">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Ganado</p>
                <p className="text-lg font-bold">{totalEarned} BTM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-adventure">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendiente</p>
                <p className="text-lg font-bold">{pendingAmount} BTM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-adventure">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interacciones</p>
                <p className="text-lg font-bold">{interactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactions List */}
      <Card className="card-adventure">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas interacciones y recompensas obtenidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interactions.map((interaction) => {
              const { date, time } = formatDate(interaction.timestamp);
              
              return (
                <div
                  key={interaction.id}
                  className="flex items-center space-x-4 p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors"
                >
                  {/* Brand Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={interaction.brandLogo} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {interaction.brand.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(interaction.type)}
                        <h3 className="font-medium">{interaction.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {interaction.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(interaction.status)}
                        <Badge className={getStatusColor(interaction.status)}>
                          {interaction.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4 text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{interaction.location}</span>
                        </span>
                        <span>•</span>
                        <span>{interaction.brand}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="font-medium">
                            {interaction.status === 'completed' ? '+' : ''}
                            {interaction.amount} {interaction.currency}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {date} • {time}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {interaction.description}
                    </p>

                    {interaction.transactionHash && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver TX: {interaction.transactionHash.slice(0, 10)}...
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          <div className="pt-4 text-center">
            <Button variant="outline">
              Cargar más interacciones
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractionHistory;