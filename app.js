// Function to convert DMS to decimal degrees
function dmsToDecimal(degrees, minutes, seconds, direction) {
    let decimal = degrees + minutes / 60 + seconds / 3600;
    if (direction === "S" || direction === "W") {
      decimal = decimal * -1;
    }
    return decimal;
}

// Convert destination coordinates in DMS format to decimal
const destinationCoords = [
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

// Custom icon for the user's current location (yellow)
const userIcon = L.icon({
    iconUrl: 'img/human.png', // Path to custom yellow marker icon
    iconSize: [25, 41], // Icon size
    iconAnchor: [12, 41] // Position where the icon is anchored to the map
});

// Custom icon for the destination location (blue)
const destinationIcon = L.icon({
    iconUrl: 'img/blueicon.png', // Path to custom blue marker icon
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Add destination marker with blue icon
L.marker(destinationCoords, { icon: destinationIcon }).addTo(map);

// Initialize Routing Machine (no initial waypoints as user's location will be set dynamically)
let userMarker = L.marker([0, 0], { icon: userIcon }).addTo(map);
let routeControl = L.Routing.control({
    waypoints: [null, L.latLng(destinationCoords)],
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

            // Update user marker position
            userMarker.setLatLng(userLocation);
            map.setView(userLocation, 19);

            // Update route with new user location
            routeControl.setWaypoints([L.latLng(userLocation), L.latLng(destinationCoords)]);
            
            // Calculate distance to destination and notify if within 5 meters
            const distance = calculateDistance(userLocation, destinationCoords);
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
