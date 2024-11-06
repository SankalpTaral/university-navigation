// Function to convert DMS to decimal degrees
function dmsToDecimal(degrees, minutes, seconds, direction) {
    let decimal = degrees + minutes / 60 + seconds / 3600;
    if (direction === "S" || direction === "W") {
      decimal = decimal * -1;
    }
    return decimal;
  }
  
  // Convert library coordinates in DMS format to decimal
  const libraryCoords = [
    dmsToDecimal(12, 51, 41, "N"), // Latitude: 12°51'41" N
    dmsToDecimal(77, 39, 52, "E")  // Longitude: 77°39'52" E
  ];
  
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
  
  // Initialize Routing Machine (no initial waypoints as user's location will be set dynamically)
  let userMarker;
  let routeControl = L.Routing.control({
    waypoints: [null, L.latLng(libraryCoords)],
    routeWhileDragging: true
  }).addTo(map);
  
  // Function to handle real-time location updates
  function startRealTimeTracking() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
  
        if (!userMarker) {
          userMarker = L.marker(userLocation).addTo(map);
        } else {
          userMarker.setLatLng(userLocation);
        }
  
        map.setView(userLocation, 19);
        routeControl.setWaypoints([L.latLng(userLocation), L.latLng(libraryCoords)]);
        
        const distance = calculateDistance(userLocation, libraryCoords);
        if (distance < 0.02) {
          alert("You have arrived at your destination!");
          navigator.geolocation.clearWatch(watchId);
        }
      }, (error) => {
        console.error("Geolocation error: ", error);
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }
  
  // Function to calculate the distance between two locations (in kilometers)
  function calculateDistance(loc1, loc2) {
    const R = 6371;
    const dLat = (loc2[0] - loc1.lat) * Math.PI / 180;
    const dLng = (loc2[1] - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2[0] * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }
  
  // Start tracking when the page loads
  startRealTimeTracking();
  
