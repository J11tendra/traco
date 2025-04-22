const socket = io();

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

const map = L.map("map", {
    center: [20, 78],
    zoom: 5,
    layers: [streetLayer]
});

map.setMinZoom(4);

const baseMaps = {
    "Street Map": streetLayer,
    "Satellite": satelliteLayer
};
L.control.layers(baseMaps).addTo(map);

const markers = {};
const centeredDevices = new Set();
const esp32Icon = L.icon({
    iconUrl: '/images/car.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    if (!centeredDevices.has(id)) {
        map.setView([latitude, longitude], 16);
        centeredDevices.add(id);
    }

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude], { icon: esp32Icon })
            .addTo(map)
            .bindPopup(`Device ID: ${id}`);
    }
});

L.control.locate({
    position: "topleft",
    flyTo: true,
    strings: { title: "Show my location" },
    locateOptions: { enableHighAccuracy: true }
}).addTo(map);

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
        centeredDevices.delete(id);
    }
});
