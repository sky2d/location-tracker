'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export default function RegistrationTracker() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [memberId, setMemberId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let watchId: number;

    if (isRegistered && memberId && isTracking) {
      if (!('geolocation' in navigator)) {
        setTimeout(() => {
          setLocationError('Geolocation is not supported by your browser.');
          setIsTracking(false);
        }, 0);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      if (!socketRef.current) {
        socketRef.current = io(apiUrl);
      }

      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          setLocationError(null);
          const { latitude, longitude } = position.coords;
          
          // Emit via WebSocket instead of HTTP POST
          socketRef.current?.emit('send_location', {
            memberId,
            lat: latitude,
            lng: longitude
          });
        },
        (err: GeolocationPositionError) => {
          console.error('Geolocation error:', err);
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setLocationError('Location permission denied. Please allow location access.');
              break;
            case err.POSITION_UNAVAILABLE:
              setLocationError('Location unavailable. Check your device settings.');
              break;
            case err.TIMEOUT:
              setLocationError('Location request timed out. Retrying...');
              return; // Don't stop tracking on timeout — watchPosition will retry
            default:
              setLocationError('An unknown geolocation error occurred.');
          }
          setIsTracking(false);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isRegistered, memberId, isTracking]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (data.memberId) {
        setMemberId(data.memberId);
        setIsRegistered(true);
        setIsTracking(true); // Auto-start tracking on register
      }
    } catch (err) {
      console.error('Registration failed', err);
    }
  };

  if (isRegistered) {
    return (
      <div className="absolute top-4 right-4 z-10 p-4 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 shadow-2xl">
        <h2 className="text-xl font-bold text-white tracking-tight mb-2">My Status</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-white">
            {isTracking ? 'Broadcasting Location' : 'Tracking Paused'}
          </span>
        </div>
        {locationError && (
          <p className="mt-2 text-xs text-red-400">{locationError}</p>
        )}
        <button 
          onClick={() => setIsTracking(!isTracking)}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
        >
          {isTracking ? 'Stop Tracking' : 'Resume Tracking'}
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-20 p-6 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl w-96">
      <h2 className="text-2xl font-bold text-white mb-4">Join Live Tracking</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-black/50 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-black/50 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="john@example.com"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-white text-black font-semibold py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          Start Broadcasting
        </button>
      </form>
    </div>
  );
}
