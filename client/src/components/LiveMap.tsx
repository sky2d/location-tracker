import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LocationData } from '../hooks/useLiveLocations';

// Fix Leaflet's default icon path issues in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// A component to auto-center the map on the most recent location
function AutoCenterMap({ locations }: { locations: LocationData[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      // Center on the first person in the list with a street-level zoom (14)
      map.flyTo([locations[0].lat, locations[0].lng], 14, { duration: 1 });
    }
  }, [locations, map]);
  return null;
}

export default function LiveMap({ locations }: { locations: LocationData[] }) {
  return (
    <div className="w-full h-screen absolute inset-0 z-0">
      <MapContainer 
        center={[0, 0]} 
        zoom={2} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((loc) => (
          <Marker 
            key={loc.memberId} 
            position={[loc.lat, loc.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="font-bold text-lg text-black">{loc.memberId}</div>
              <div className="text-xs text-gray-500">Live Tracker</div>
            </Popup>
          </Marker>
        ))}
        
        <AutoCenterMap locations={locations} />
      </MapContainer>
    </div>
  );
}
