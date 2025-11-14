import { Button } from "@/components/ui/button";
import { ArrowRight, Mountain, Zap, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              BigTrail
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              La plataforma Web3 que conecta aventureros, marcas y creadores de contenido en el ecosistema outdoor
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold px-8 py-3 text-lg"
                onClick={() => navigate("/select-user")}
              >
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-3 text-lg"
                onClick={() => navigate("/photo-example")}
              >
                Ver Photo Cards
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <Mountain className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Para Aventureros</h3>
              <p className="text-muted-foreground">
                Descubre airdrops, participa en campañas y conecta con la comunidad outdoor
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <Zap className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <h3 className="text-xl font-semibold mb-2">Para Marcas</h3>
              <p className="text-muted-foreground">
                Crea campañas dirigidas y conecta con tu audiencia objetivo de forma innovadora
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <Globe className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h3 className="text-xl font-semibold mb-2">Para Creadores</h3>
              <p className="text-muted-foreground">
                Monetiza tu contenido y construye una audiencia leal en el mundo outdoor
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
