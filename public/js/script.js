// // const socket = io();

// // if (navigator.geolocation) {
// //     navigator.geolocation.watchPosition((position) => {
// //         const { latitude, longitude } = position.coords;
// //         socket.emit("send-location", { latitude, longitude });
// //     }, (error) => {
// //         console.log(error);
// //     },
// //         {
// //             enableHighAccuracy: true,
// //             timeout: 5000,
// //             maximumAge: 0,
// //         }
// //     );
// // };


// // const map = L.map("map").setView([0, 0], 3);

// // L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
// //     attribution: "©Jitendra Choudhary",
// //     nowrap: true,
// // }).addTo(map);


// // // map.setMaxBounds([
// // //     [-85, -180],
// // //     [85, 180]
// // // ]);

// // map.setMinZoom(4);

// // const markers = {}

// // socket.on("receive-location", (data) => {
// //     const { id, latitude, longitude } = data;
// //     map.setView([latitude, longitude], 16);

// //     if (markers[id]) {
// //         markers[id].setLatLng([latitude, longitude]);
// //     }
// //     else {
// //         markers[id] = L.marker([latitude, longitude]).addTo(map);
// //     };
// // })


// const socket = io();
// const map = L.map("map").setView([20, 78], 5);

// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution: "© Jitendra Choudhary",
//     noWrap: true,
// }).addTo(map);

// map.setMinZoom(4);

// const markers = {};
// let mapCentered = false;

// if (navigator.geolocation) {
//     navigator.geolocation.watchPosition(
//         (position) => {
//             const { latitude, longitude } = position.coords;
//             socket.emit("send-location", { latitude, longitude });
//         },
//         (error) => {
//             console.log("Geolocation error:", error);
//         },
//         {
//             enableHighAccuracy: true,
//             timeout: 5000,
//             maximumAge: 0,
//         }
//     );
// }

// socket.on("receive-location", (data) => {
//     const { id, latitude, longitude } = data;

//     if (!mapCentered && id === socket.id) {
//         map.setView([latitude, longitude], 16);
//         mapCentered = true;
//     }

//     if (markers[id]) {
//         markers[id].setLatLng([latitude, longitude]);
//     } else {
//         markers[id] = L.marker([latitude, longitude]).addTo(map);
//     }
// });

// L.control
//   .locate({
//     position: "topleft",
//     flyTo: true,
//     strings: {
//       title: "Show my location",
//     },
//     locateOptions: {
//       enableHighAccuracy: true,
//     },
//   })
//   .addTo(map);


// socket.on("user-disconnected", (id) => {
// if (markers[id]) {
//     map.removeLayer(markers[id]);
//     delete markers[id];
// }
// });

// NEWCODE ADDED


// const socket = io();
// const map = L.map("map").setView([20, 78], 5);

// // Add OpenStreetMap tile layer
// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution: "© Jitendra Choudhary",
//     noWrap: true,
// }).addTo(map);


// map.setMinZoom(4);

// const markers = {};
// const centeredDevices = new Set();

// // Listen for location data from server (multiple devices)
// socket.on("receive-location", (data) => {
//     const { id, latitude, longitude } = data;

//     // Center map on first location received per device
//     if (!centeredDevices.has(id)) {
//         map.setView([latitude, longitude], 16);
//         centeredDevices.add(id);
//     }

//     // Update or add marker for each device
//     if (markers[id]) {
//         markers[id].setLatLng([latitude, longitude]);
//     } else {
//         markers[id] = L.marker([latitude, longitude]).addTo(map)
//             .bindPopup(`Device ID: ${id}`);
//     }
// });

// // Optional: add recenter button (Leaflet.LocateControl)
// L.control
//   .locate({
//     position: "topleft",
//     flyTo: true,
//     strings: {
//       title: "Show my location",
//     },
//     locateOptions: {
//       enableHighAccuracy: true,
//     },
//   })
//   .addTo(map);

// // Cleanup when a device disconnects
// socket.on("user-disconnected", (id) => {
//     if (markers[id]) {
//         map.removeLayer(markers[id]);
//         delete markers[id];
//         centeredDevices.delete(id);
//     }
// });


// NEWCODEADDED

const socket = io();

// Define base layers
const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© Jitendra Choudhary",
    noWrap: true
});

const satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution: "© Jitendra Choudhary",
        maxZoom: 18,
    }
);

// Initialize map with the street layer by default
const map = L.map("map", {
    center: [20, 78],
    zoom: 5,
    layers: [streetLayer]
});

map.setMinZoom(4);

// Layer control for toggling
const baseMaps = {
    "Street Map": streetLayer,
    "Satellite": satelliteLayer
};
L.control.layers(baseMaps).addTo(map);

// Marker storage and centering logic
const markers = {};
const centeredDevices = new Set();
const esp32Icon = L.icon({
    iconUrl: '/images/car.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

// Listen for location data from server (multiple devices)
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    // Center map on first location received per device
    if (!centeredDevices.has(id)) {
        map.setView([latitude, longitude], 16);
        centeredDevices.add(id);
    }

    // Update or add marker for each device
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude], { icon: esp32Icon })
            .addTo(map)
            .bindPopup(`Device ID: ${id}`);
    }
});

// Optional: add recenter button (Leaflet.LocateControl)
L.control.locate({
    position: "topleft",
    flyTo: true,
    strings: { title: "Show my location" },
    locateOptions: { enableHighAccuracy: true }
}).addTo(map);

// Cleanup when a device disconnects
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
        centeredDevices.delete(id);
    }
});
