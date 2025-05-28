const socket = io();

const marker = {};
const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://bitbuilders.tech/" target="_blank">BitBuilders Tech</a>',
}).addTo(map);

socket.on("connect", () => {
  console.log("Connected to server with id", socket.id);
});

socket.on("existing-users", (allUsers) => {
  Object.entries(allUsers).forEach(([id, data]) => {
    const { latitude, longitude } = data;

    const offset = calculateOffset(latitude, longitude);
    marker[id] = L.marker([offset.lat, offset.lng]).addTo(map);
  });
});

socket.on("recieve-location", (data) => {
  const { id, latitude, longitude } = data;

  const offset = calculateOffset(latitude, longitude);

  map.setView([latitude, longitude]);

  if (marker[id]) {
    marker[id].setLatLng([offset.lat, offset.lng]);
  } else {
    marker[id] = L.marker([offset.lat, offset.lng]).addTo(map);
  }
});

socket.on("user-disconnected", ({ id }) => {
  if (marker[id]) {
    map.removeLayer(marker[id]);
    delete marker[id];
  }
});

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

      socket.emit("send-location", {
        latitude,
        longitude,
      });
    },
    (error) => {
      console.error("Error getting location:", error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }
  );
}

// Function to handle overlapping markers
function calculateOffset(lat, lng) {
  const sameCoordCount = Object.values(marker).filter((mk) => {
    const pos = mk.getLatLng();
    return pos.lat === lat && pos.lng === lng;
  }).length;

  const offsetAmount = 0.0001 * sameCoordCount;

  return {
    lat: lat + offsetAmount,
    lng: lng + offsetAmount,
  };
}
