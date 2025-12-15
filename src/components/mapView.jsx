import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useNavigate } from '@tanstack/react-router';

const DEFAULT_CENTER = { lat: 22.35, lng: 114.14 };

export default function MapComponent({ 
  venues = [], 
  center = DEFAULT_CENTER, 

  zoom = 11
}) {
  const navigate = useNavigate();
  const API_KEY = import.meta.env.VITE_MAP_API_KEY;

  if (!API_KEY) {
    return <div className="p-4 text-red-500">Error: VITE_MAP_API_KEY is missing in .env</div>;
  }

  return (
    <div className="h-[550px] w-full rounded-md overflow-hidden shadow-md border border-gray-200">
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="DEMO_MAP_ID" 
          gestureHandling={'greedy'}
          disableDefaultUI={false}
        >
          {venues.map((venue) => {
            if (!venue.latitude || !venue.longitude) return null;

            return (
              <AdvancedMarker
                key={venue.venueId} 
                position={{ lat: venue.latitude, lng: venue.longitude }}
                onClick={() => {
                  navigate({ to: `/venues/${venue.venueId}` });
                }}
              >
                <Pin background={'#E11D48'} glyphColor={'#FFF'} borderColor={'#BE123C'} />
              </AdvancedMarker>
            );
          })}
        </Map>
      </APIProvider>
    </div>
  );
}