'use client';

import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('./LiveMap'), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-black flex items-center justify-center text-white">Loading map...</div>
});

export default LiveMap;
