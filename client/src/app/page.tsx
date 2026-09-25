'use client';

import { useLiveLocations } from '../hooks/useLiveLocations';
import DashboardMap from '../components/DashboardMap';
import RegistrationTracker from '../components/RegistrationTracker';

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const locations = useLiveLocations(apiUrl); // Connect to our Node backend

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-black">
      <div className="absolute top-4 left-4 z-10 p-4 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 shadow-2xl">
        <h1 className="text-2xl font-bold text-white tracking-tight">Real-Time Locations</h1>
        <div className="mt-2 flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-green-400">
            {locations.length} Active Members
          </span>
        </div>
      </div>
      
      {/* Registration and Real-time Geolocation Tracker */}
      <RegistrationTracker />

      {/* 2D Leaflet Street Map visualization */}
      <DashboardMap locations={locations} />
    </main>
  );
}
