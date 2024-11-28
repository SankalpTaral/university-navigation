// Function to convert DMS to decimal degrees
function dmsToDecimal(degrees, minutes, seconds, direction) {
    let decimal = degrees + minutes / 60 + seconds / 3600;
    if (direction === "S" || direction === "W") {
        decimal *= -1;
    }
    return decimal;
}

// Convert destination coordinates (12°51'42" N, 77°39'53" E) in DMS format to decimal
const destinationCoords = [
    dmsToDecimal(12, 51, 42, "N"), // Latitude: 12°51'42" N
    dmsToDecimal(77, 39, 53, "E")  // Longitude: 77°39'53" E
];

// Initialize the Leaflet Map (center will be set dynamically later)
const map = L.map('map').setView([0, 0], 19); // Temporary center

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 22,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Custom icons
const userIcon = L.icon({
    iconUrl: 'img/human.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const destinationIcon = L.icon({
    iconUrl: 'img/blueicon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Add destination marker with blue icon
L.marker(destinationCoords, { icon: destinationIcon }).addTo(map);

// Initialize Routing Machine
let userMarker = null;
let routeControl = L.Routing.control({
    waypoints: [null, L.latLng(destinationCoords)],
    routeWhileDragging: true
}).addTo(map);

// Function to calculate the distance between two locations (in kilometers)
function calculateDistance(loc1, loc2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (loc2[0] - loc1.lat) * Math.PI / 180;
    const dLng = (loc2[1] - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2[0] * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Start real-time tracking
function startRealTimeTracking() {
    if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition((position) => {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // Set initial view dynamically
            if (!userMarker) {
                map.setView(userLocation, 19);
            }

            // Update user marker
            if (userMarker) {
                map.removeLayer(userMarker);
            }
            userMarker = L.marker(userLocation, { icon: userIcon }).addTo(map);

            // Update route
            routeControl.setWaypoints([L.latLng(userLocation), L.latLng(destinationCoords)]);

            // Calculate distance to destination
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

// Start tracking on page load
startRealTimeTracking();
