import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  MapPin, 
  Coins, 
  Users, 
  Target, 
  Calendar,
  Activity,
  Award
} from 'lucide-react';

const StatsCards = () => {
  const stats = [
    {
      title: 'Tokens Ganados',
      value: '2,847',
      unit: 'BTM',
      change: '+12.5%',
      trend: 'up',
      icon: Coins,
      description: 'Total acumulado este mes',
      color: 'text-warning'
    },
    {
      title: 'Zonas Activas',
      value: '15',
      unit: 'zonas',
      change: '+3',
      trend: 'up',
      icon: MapPin,
      description: 'Airdrops disponibles ahora',
      color: 'text-success'
    },
    {
      title: 'Campañas Completadas',
      value: '28',
      unit: 'campañas',
      change: '+5',
      trend: 'up',
      icon: Target,
      description: 'Este mes',
      color: 'text-primary'
    },
    {
      title: 'Ranking Global',
      value: '#342',
      unit: '',
      change: '+15',
      trend: 'up',
      icon: Award,
      description: 'Entre 10,240 usuarios',
      color: 'text-accent'
    }
  ];

  const userProgress = {
    level: 12,
    experience: 2847,
    nextLevel: 3000,
    completedCampaigns: 28,
    totalInteractions: 156
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === 'up';
          
          return (
            <Card key={index} className="card-adventure">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value}
                  {stat.unit && (
                    <span className="text-sm text-muted-foreground ml-1">
                      {stat.unit}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Badge 
                    variant={isPositive ? "default" : "secondary"}
                    className={`${isPositive ? 'bg-success text-success-foreground' : ''} px-1 py-0`}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </Badge>
                  <span>{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Progress */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-adventure">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Progreso del Usuario</span>
            </CardTitle>
            <CardDescription>
              Nivel {userProgress.level} • {userProgress.experience}/{userProgress.nextLevel} XP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Experiencia</span>
                <span>{Math.round((userProgress.experience / userProgress.nextLevel) * 100)}%</span>
              </div>
              <Progress 
                value={(userProgress.experience / userProgress.nextLevel) * 100}
                className="h-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userProgress.completedCampaigns}</div>
                <div className="text-xs text-muted-foreground">Campañas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{userProgress.totalInteractions}</div>
                <div className="text-xs text-muted-foreground">Interacciones</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-adventure">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-warning" />
              <span>Actividad Reciente</span>
            </CardTitle>
            <CardDescription>
              Últimas interacciones del usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  action: 'Airdrop completado',
                  location: 'Centro Histórico',
                  reward: '100 BTM',
                  time: 'Hace 2h'
                },
                {
                  action: 'Nueva zona descubierta',
                  location: 'Parque Central',
                  reward: '50 XP',
                  time: 'Hace 4h'
                },
                {
                  action: 'Campaña publicitaria',
                  location: 'Plaza Mayor',
                  reward: '25 BTM',
                  time: 'Hace 6h'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.location}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-success">+{activity.reward}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsCards;