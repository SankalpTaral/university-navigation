// Initialize the Leaflet Map
const map = L.map('map').setView([12.85888960563884, 77.66242347519417], 19); // Starting point at entrance

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 22,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Variables to hold the GeoJSON layers for each floor
let floor1, floor2;

// Load the GeoJSON data for Floor 1
fetch('geojson/floor1.geojson')
  .then(response => response.json())
  .then(data => {
    floor1 = L.geoJSON(data, {
      style: { color: "#ffeb3b", fillOpacity: 0.7 }
    }).addTo(map); // Add Floor 1 to the map by default
  });

// Load the GeoJSON data for Floor 2
fetch('geojson/floor2.geojson')
  .then(response => response.json())
  .then(data => {
    floor2 = L.geoJSON(data, {
      style: { color: "#4caf50", fillOpacity: 0.7 }
    });

    // Initially, hide Floor 2
    map.removeLayer(floor2);
  });

// Define the starting point (entrance) and destination (library)
const startCoords = [12.85888960563884, 77.66242347519417]; // Entrance coordinates
const libraryCoords = [12.861, 77.665]; // Library coordinates

// Initialize Routing Machine
let userMarker = L.marker(startCoords).addTo(map); // Add marker at the entrance
let routeControl = L.Routing.control({
  waypoints: [L.latLng(startCoords), L.latLng(libraryCoords)],
  routeWhileDragging: true
}).addTo(map);

// Function to handle real-time location updates
function startRealTimeTracking() {
  // Use the Geolocation API to get the current location
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Update the user's position on the map
      userMarker.setLatLng(userLocation);

      // Re-center the map around the user’s location
      map.setView(userLocation, 19);

      // Update the route to the destination
      routeControl.setWaypoints([L.latLng(userLocation), L.latLng(libraryCoords)]);
      
      // Optionally, calculate the distance between user and destination to stop navigation once arrived
      const distance = calculateDistance(userLocation, libraryCoords);
      if (distance < 0.02) { // If within 20 meters of destination
        alert("You have arrived at your destination!");
        navigator.geolocation.clearWatch(watchId); // Stop watching the position
      }
    }, (error) => {
      console.error("Geolocation error: ", error);
    }, {
      enableHighAccuracy: true, // Use high accuracy if possible
      timeout: 10000, // Timeout after 10 seconds
      maximumAge: 0 // Don't use cached positions
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Function to calculate the distance between two locations (in kilometers)
function calculateDistance(loc1, loc2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

// Start tracking when the page loads
startRealTimeTracking();
