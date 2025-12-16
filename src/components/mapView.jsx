import React, { useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { useNavigate } from '@tanstack/react-router';

const DEFAULT_CENTER = { lat: 22.35, lng: 114.14 };
const DEFAULT_ZOOM = 11;

// [NEW] Helper component to handle camera movement
const CameraControl = ({ selectedVenue }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !selectedVenue) return;

    // 1. Pan to the new center
    map.panTo({ lat: selectedVenue.latitude, lng: selectedVenue.longitude });
    
    // 2. Zoom in significantly (Level 16 is street level)
    map.setZoom(12);
    
  }, [map, selectedVenue]);

  return null;
};

export default function MapComponent({ 
  venues = [], 
  center = DEFAULT_CENTER, 
  zoom = DEFAULT_ZOOM,
  selectedVenue = null, // Receive the selected venue
  onMarkerClick = () => {} 
}) {
  const navigate = useNavigate();
  const API_KEY = import.meta.env.VITE_MAP_API_KEY;

  if (!API_KEY) {
    return <div className="p-4 text-red-500">Error: VITE_MAP_API_KEY is missing in .env</div>;
  }

  return (
    <div className="h-[750px] w-full rounded-md overflow-hidden shadow-md border border-gray-200">
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="DEMO_MAP_ID" 
          gestureHandling={'greedy'}
          disableDefaultUI={false}
        >
          {/* [CRITICAL] This component handles the zooming logic */}
          <CameraControl selectedVenue={selectedVenue} />

          {venues.map((venue) => {
            if (!venue.latitude || !venue.longitude) return null;

            // Determine if this marker is the selected one
            const isSelected = selectedVenue?.venueId === venue.venueId;

            return (
              <AdvancedMarker
                key={venue.venueId} 
                position={{ lat: venue.latitude, lng: venue.longitude }}
                onClick={() => onMarkerClick(venue)}
                zIndex={isSelected ? 100 : 1} // Bring selected marker to front
              >
                <Pin 
                  background={isSelected ? '#2563EB' : '#E11D48'} // Blue if selected, Red if not
                  glyphColor={'#FFF'} 
                  borderColor={'#FFF'} 
                  scale={isSelected ? 1.2 : 1.0} // Make selected pin slightly bigger
                />
              </AdvancedMarker>
            );
          })}
        </Map>
      </APIProvider>
    </div>
  );
}