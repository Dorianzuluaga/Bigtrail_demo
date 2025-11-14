import React from 'react';
import PhotoCard from './PhotoCard';

const PhotoCardExample: React.FC = () => {
  // Datos de ejemplo
  const mockAttendees = [
    {
      id: '1',
      name: 'Ana García',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      initials: 'AG'
    },
    {
      id: '2',
      name: 'Carlos López',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      initials: 'CL'
    },
    {
      id: '3',
      name: 'María Rodríguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      initials: 'MR'
    },
    {
      id: '4',
      name: 'Juan Pérez',
      initials: 'JP'
    },
    {
      id: '5',
      name: 'Laura Martín',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      initials: 'LM'
    },
    {
      id: '6',
      name: 'Diego Silva',
      initials: 'DS'
    }
  ];

  const photoExamples = [
    {
      id: '1',
      photoUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop',
      title: 'Aventura en la Montaña',
      attendees: mockAttendees.slice(0, 4)
    },
    {
      id: '2',
      photoUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      title: 'Excursión en el Bosque',
      attendees: mockAttendees.slice(1, 6)
    },
    {
      id: '3',
      photoUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
      title: 'Campamento de Verano',
      attendees: mockAttendees
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Photo Cards con Avatares Flotantes</h1>
        <p className="text-muted-foreground">
          Pasa el mouse sobre las imágenes para ver quién estuvo presente en cada momento
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photoExamples.map((photo) => (
          <PhotoCard
            key={photo.id}
            photoUrl={photo.photoUrl}
            title={photo.title}
            attendees={photo.attendees}
            className="max-w-sm"
          />
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Instrucciones:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Pasa el mouse sobre cualquier imagen para ver los avatares flotantes</li>
          <li>• Los avatares aparecen en posiciones aleatorias con animación</li>
          <li>• Haz hover sobre un avatar para ver el nombre de la persona</li>
          <li>• El contador muestra cuántas personas estuvieron presentes</li>
        </ul>
      </div>
    </div>
  );
};

export default PhotoCardExample;