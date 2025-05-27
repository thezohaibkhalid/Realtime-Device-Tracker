const socket = io();

socket.on("connect", () => {
  console.log("Connected to the server");
});

if (navigator.geolocation) {
  navigator.geolocation.watchPosition((posiiton) => {
    const { latitude, longitude } = posiiton.coords;
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

    socket.emit("location", {
      latitude: latitude,
      longitude: longitude,
    });
  });
}
