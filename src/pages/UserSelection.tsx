import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bike, 
  Building2, 
  Camera, 
  ArrowRight,
  Users,
  Target,
  TrendingUp,
  MapIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import bigtrailLogo from "@/assets/bigtrail-logo.png";

const UserSelection = () => {
  const navigate = useNavigate();

  const userTypes = [
    {
      id: "rider",
      title: "Rider / Deportista",
      description: "Explora zonas de airdrop, participa en campañas y conecta con la comunidad outdoor",
      icon: <Bike className="w-12 h-12" />,
      features: [
        "Mapa de airdrops activos",
        "Rewards y recompensas",
        "Historial de actividades",
        "Comunidad de riders"
      ],
      route: "/dashboard",
      color: "primary",
      gradient: "from-primary to-primary/80"
    },
    {
      id: "brand",
      title: "Marca / Anunciante",
      description: "Crea campañas de airdrop, gestiona publicidad y conecta con tu audiencia",
      icon: <Building2 className="w-12 h-12" />,
      features: [
        "Crear campañas de airdrop",
        "Gestión publicitaria",
        "Analytics avanzados",
        "Segmentación de audiencia"
      ],
      route: "/brand-dashboard",
      color: "secondary",
      gradient: "from-secondary to-secondary/80"
    },
    {
      id: "creator",
      title: "Creador de Contenido",
      description: "Comparte tus aventuras, monetiza tu contenido y construye tu audiencia",
      icon: <Camera className="w-12 h-12" />,
      features: [
        "Editor de contenido",
        "Monetización directa",
        "Analytics de engagement",
        "Herramientas de creación"
      ],
      route: "/creator-dashboard",
      color: "accent",
      gradient: "from-accent to-accent/80"
    },
        {
      id: "MapExampleGoogle",
      title: "Map / AirDrops",
      description: "Explora zonas de airdrop, participa en campañas y conecta con la comunidad outdoor",
      icon: <MapIcon className="w-12 h-12" />,
      features: [
        "Mapa de airdrops activos",
        "Rewards y recompensas",
        "Historial de actividades",
        "Comunidad de riders"
      ],
      route: "/map-example",
      color: "primary",
      gradient: "from-primary to-primary/80"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <img 
              src={bigtrailLogo} 
              alt="BigTrail" 
              className="h-12 w-auto"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Bienvenido a BigTrail
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Elige tu perfil para acceder a las herramientas diseñadas específicamente para ti
            </p>
            <Badge variant="outline" className="text-sm">
              Plataforma Web3 para la comunidad outdoor
            </Badge>
          </div>

          {/* User Type Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {userTypes.map((type) => (
              <Card 
                key={type.id} 
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <CardHeader className="text-center relative z-10">
                  <div className={`mx-auto mb-4 p-4 rounded-2xl bg-gradient-to-br ${type.gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
                    {type.icon}
                  </div>
                  <CardTitle className="text-xl mb-2">{type.title}</CardTitle>
                  <CardDescription className="text-center">
                    {type.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10">
                  <ul className="space-y-2 mb-6">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full bg-${type.color}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full group-hover:scale-105 transition-transform duration-200"
                    onClick={() => navigate(type.route)}
                  >
                    Acceder como {type.title.split(' ')[0]}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold text-primary">12,847</div>
                <p className="text-sm text-muted-foreground">Usuarios activos</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Target className="w-8 h-8 mx-auto mb-3 text-secondary" />
                <div className="text-2xl font-bold text-secondary">156</div>
                <p className="text-sm text-muted-foreground">Campañas activas</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-accent" />
                <div className="text-2xl font-bold text-accent">€847K</div>
                <p className="text-sm text-muted-foreground">Rewards distribuidos</p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="py-8">
                <h3 className="text-2xl font-bold mb-4">¿No estás seguro de qué perfil elegir?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Puedes cambiar de perfil en cualquier momento desde la configuración de tu cuenta. 
                  Cada perfil está optimizado para diferentes necesidades dentro del ecosistema BigTrail.
                </p>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  Comenzar como Rider
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserSelection;