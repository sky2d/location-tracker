const axios = require('axios');

const API_URL = 'http://localhost:4000/api/location';

// Let's create some dummy members around the world
const members = [
  { id: 'user_ny', lat: 40.7128, lng: -74.0060 },
  { id: 'user_london', lat: 51.5074, lng: -0.1278 },
  { id: 'user_tokyo', lat: 35.6762, lng: 139.6503 },
  { id: 'user_sydney', lat: -33.8688, lng: 151.2093 },
  { id: 'user_sf', lat: 37.7749, lng: -122.4194 }
];

console.log('🚀 Starting member movement simulator...');

// Send location updates every 2 seconds
setInterval(() => {
  members.forEach(async (member) => {
    // Add small random movement
    member.lat += (Math.random() - 0.5) * 0.05;
    member.lng += (Math.random() - 0.5) * 0.05;

    try {
      await axios.post(API_URL, {
        memberId: member.id,
        lat: member.lat,
        lng: member.lng
      });
      console.log(`📍 Updated ${member.id} at [${member.lat.toFixed(4)}, ${member.lng.toFixed(4)}]`);
    } catch (error) {
      console.error(`❌ Failed to update ${member.id}:`, error.message);
    }
  });
}, 2000);
