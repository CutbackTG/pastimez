let map;
let userLocation;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 50.266, lng: -5.052 }, // Fallback to Cornwall
    zoom: 10
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(userLocation);
      new google.maps.Marker({
        position: userLocation,
        map,
        title: "You are here"
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const hobby = document.getElementById("hobby").value;
    const radius = parseInt(document.getElementById("radius").value) * 1000; // km to meters

    if (!userLocation) {
      alert("User location not available yet.");
      return;
    }

    const service = new google.maps.places.PlacesService(map);
    const request = {
      location: userLocation,
      radius: radius,
      keyword: hobby + " club" // e.g. "photography club", "hiking club"
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        results.forEach(place => {
          const marker = new google.maps.Marker({
            map,
            position: place.geometry.location,
            title: place.name
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="max-width: 200px;">
                <strong>${place.name}</strong><br/>
                ${place.vicinity || ""}<br/>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}" target="_blank">View on Google Maps</a>
              </div>
            `
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });
        });
      } else {
        alert("No results found.");
      }
    });
  });
});
