let map;
let userLocation;
let markers = []; // Track markers for clearing later

// Initialize map globally for Google Maps API callback
window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 50.266, lng: -5.052 }, // Fallback to Cornwall
    zoom: 10,
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(userLocation);

        const userMarker = new google.maps.Marker({
          position: userLocation,
          map,
          title: "You are here",
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          },
        });
        markers.push(userMarker);
      },
      () => {
        console.warn("Geolocation permission denied or unavailable.");
      }
    );
  }
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // Clear existing markers except user location marker
    markers.forEach((m) => m.setMap(null));
    markers = [];

    if (!userLocation) {
      alert("User location not available yet.");
      return;
    }

    const hobby = document.getElementById("hobbyInput").value.trim();
    const preference = document.getElementById("indoorOutdoor").value;
    const radiusMiles = parseInt(document.getElementById("radius").value);
    const radiusMeters = radiusMiles * 1609.34; // Convert miles to meters

    // Build keyword with preference
    let keyword = hobby;
    if (preference === "indoor") {
      keyword += " indoor club";
    } else if (preference === "outdoor") {
      keyword += " outdoor club";
    } else {
      keyword += " club";
    }

    const service = new google.maps.places.PlacesService(map);
    const request = {
      location: userLocation,
      radius: radiusMeters,
      keyword: keyword,
    };

    const carouselInner = document.getElementById("carouselInner");
    carouselInner.innerHTML = ""; // Clear previous results

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        results.forEach((place, index) => {
          const marker = new google.maps.Marker({
            map,
            position: place.geometry.location,
            title: place.name,
          });
          markers.push(marker);

          const activeClass = index === 0 ? "active" : "";
          const photoUrl =
            place.photos && place.photos.length
              ? place.photos[0].getUrl({ maxWidth: 300, maxHeight: 200 })
              : "https://via.placeholder.com/300x200?text=No+Image";

          const ratingHtml = place.rating
            ? `<p class="mb-1">⭐ ${place.rating} / 5</p>`
            : `<p class="text-muted mb-1">No rating available</p>`;

          const card = `
            <div class="carousel-item ${activeClass}">
              <div class="d-flex justify-content-center">
                <div class="card" style="width: 18rem;">
                  <img src="${photoUrl}" class="card-img-top" alt="${place.name} logo or photo" />
                  <div class="card-body">
                    <h5 class="card-title">${place.name}</h5>
                    <p class="card-text">${place.vicinity || "No address available"}</p>
                    ${ratingHtml}
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      place.name
                    )}" target="_blank" class="btn btn-primary">View on Google Maps</a>
                  </div>
                </div>
              </div>
            </div>
          `;

          carouselInner.insertAdjacentHTML("beforeend", card);

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="max-width: 200px;">
                <strong>${place.name}</strong><br/>
                ${place.vicinity || ""}<br/>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  place.name
                )}" target="_blank">View on Google Maps</a>
              </div>
            `,
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
