// Set new destination coordinates directly in decimal format
const libraryCoords = [12.870788292132739, 77.66943100040578];

// Initialize the Leaflet Map
const map = L.map('map').setView([12.85888960563884, 77.66242347519417], 19); // Starting point at entrance

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 22,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Initialize Routing Machine (waypoints set dynamically)
let userMarker;
let destinationMarker = L.marker(libraryCoords, { icon: L.icon({
    iconUrl: 'path/to/blue-marker-icon.png',  // Replace with actual path to a blue marker icon
    iconSize: [25, 41],
    iconAnchor: [12, 41]
}) }).addTo(map);

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
                userMarker = L.marker(userLocation, { icon: L.icon({
                    iconUrl: 'path/to/yellow-marker-icon.png',  // Replace with actual path to a yellow marker icon
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                }) }).addTo(map);
            } else {
                userMarker.setLatLng(userLocation);
            }

            map.setView(userLocation, 19);

            // Update route with the new user location
            routeControl.setWaypoints([L.latLng(userLocation), L.latLng(libraryCoords)]);

            // Calculate distance and check if the user has arrived
            const distance = calculateDistance(userLocation, libraryCoords);
            if (distance < 0.005) { // Within 5 meters
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
