import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PersonProfile {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
}

interface PhotoCardProps {
  photoUrl: string;
  title?: string;
  attendees: PersonProfile[];
  className?: string;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  photoUrl,
  title,
  attendees,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Generar posiciones aleatorias para los avatares
  const generateRandomPositions = () => {
    return attendees.map((person, index) => ({
      ...person,
      x: Math.random() * 80 + 10, // 10% a 90% del ancho
      y: Math.random() * 80 + 10, // 10% a 90% del alto
      delay: index * 100, // Delay escalonado para la animación
    }));
  };

  const [floatingProfiles] = useState(() => generateRandomPositions());

  return (
    <Card className={`overflow-hidden transition-shadow duration-300 hover:shadow-lg ${className}`}>
      <CardContent className="p-0">
        <div 
          className="relative w-full h-64 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Imagen principal */}
          <img
            src={photoUrl}
            alt={title || "Photo"}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          
          {/* Overlay oscuro en hover */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />
          
          {/* Avatares flotantes */}
          {isHovered && floatingProfiles.map((profile) => (
            <div
              key={profile.id}
              className="absolute animate-scale-in"
              style={{
                left: `${profile.x}%`,
                top: `${profile.y}%`,
                transform: 'translate(-50%, -50%)',
                animationDelay: `${profile.delay}ms`,
                animationDuration: '0.3s',
                animationFillMode: 'both'
              }}
            >
              <div className="relative group">
                <Avatar className="w-10 h-10 border-2 border-white shadow-lg hover:scale-110 transition-transform duration-200">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {profile.initials}
                  </AvatarFallback>
                </Avatar>
                
                {/* Tooltip con el nombre */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-background border rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-xs z-10">
                  {profile.name}
                </div>
                
                {/* Círculo de pulso */}
                <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping" />
              </div>
            </div>
          ))}
          
          {/* Título si existe */}
          {title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <h3 className="text-white font-semibold text-lg">{title}</h3>
            </div>
          )}
          
          {/* Contador de personas */}
          <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
            {attendees.length} {attendees.length === 1 ? 'persona' : 'personas'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoCard;