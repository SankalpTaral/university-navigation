// Function to convert DMS to decimal degrees
function dmsToDecimal(degrees, minutes, seconds, direction) {
    let decimal = degrees + minutes / 60 + seconds / 3600;
    if (direction === "S" || direction === "W") {
        decimal = decimal * -1;
    }
    return decimal;
}

// Convert destination coordinates from DMS format to decimal
const destinationCoords = [
    dmsToDecimal(12, 51, 41, "N"), // Latitude: 12°51'41" N
    dmsToDecimal(77, 39, 52, "E")  // Longitude: 77°39'52" E
];

// Initialize the Leaflet Map
const map = L.map('map').setView([12.85888960563884, 77.66242347519417], 19); // Starting point

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 22,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load Floor Layers (similar to previous setup)
let floor1Layer, floor2Layer;
fetch('geojson/floor1.geojson')
    .then(response => response.json())
    .then(data => {
        floor1Layer = L.geoJSON(data, { style: { color: "#ffeb3b", fillOpacity: 0.7 }}).addTo(map);
    });

fetch('geojson/floor2.geojson')
    .then(response => response.json())
    .then(data => {
        floor2Layer = L.geoJSON(data, { style: { color: "#4caf50", fillOpacity: 0.7 }});
    });

// Function to switch floors
function switchFloor(floor) {
    if (floor === 1) {
        map.addLayer(floor1Layer);
        map.removeLayer(floor2Layer);
    } else if (floor === 2) {
        map.addLayer(floor2Layer);
        map.removeLayer(floor1Layer);
    }
}

// Markers for user and destination
let userMarker = L.marker([0, 0], { icon: L.icon({
    iconUrl: 'path/to/yellow-marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
}) }).addTo(map);

let destinationMarker = L.marker(destinationCoords, { icon: L.icon({
    iconUrl: 'path/to/blue-marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
}) }).addTo(map);

// Real-time tracking
function startRealTimeTracking() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            userMarker.setLatLng(userLocation);
            map.setView(userLocation, 19);

            // Calculate distance to destination
            const distance = calculateDistance(userLocation, destinationCoords);
            if (distance < 0.005) { // Within 5 meters
                alert("You have arrived at your destination!");
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

// Distance calculation function (in kilometers)
function calculateDistance(loc1, loc2) {
    const R = 6371;
    const dLat = (loc2[0] - loc1.lat) * Math.PI / 180;
    const dLng = (loc2[1] - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2[0] * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Start tracking when the page loads
startRealTimeTracking();
