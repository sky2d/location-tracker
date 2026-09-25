'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { LocationData } from '../hooks/useLiveLocations';

// Import Globe dynamically with ssr: false because it relies on window/WebGL
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => <div className="flex h-screen items-center justify-center text-white">Loading 3D Globe...</div>
});

interface DashboardGlobeProps {
  locations: LocationData[];
}

export default function DashboardGlobe({ locations }: DashboardGlobeProps) {
  const globeRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    // Set initial dimensions
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (globeRef.current && isMounted) {
      const material = globeRef.current.globeMaterial();
      material.transparent = true;
      material.opacity = 0.5; // Makes the globe semi-transparent
    }
  }, [isMounted]);

  if (!isMounted) return null;
  // Format data for react-globe.gl
  // Each marker needs lat, lng, and a label or size
  const gData = locations.map(loc => ({
    lat: loc.lat,
    lng: loc.lng,
    size: 0.5,
    color: '#ff3b30', // Red marker
    label: loc.memberId
  }));

  if (dimensions.width === 0) return null;

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={gData}
        pointAltitude={0.01}
        pointColor="color"
        pointRadius="size"
        pointResolution={32}
        labelsData={gData}
        labelLat={d => (d as any).lat}
        labelLng={d => (d as any).lng}
        labelText={d => `Member ${(d as any).label.substring(0, 4)}`}
        labelSize={1.5}
        labelDotRadius={0.5}
        labelColor={() => 'rgba(255, 255, 255, 0.75)'}
        labelResolution={2}
      />
    </div>
  );
}
