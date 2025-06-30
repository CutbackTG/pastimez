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
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results.length) {
        alert("No results found.");
        return;
      }

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

        // Example category badge text and color based on keyword
        let category = "Hobby";
        let badgeColor = "bg-primary";

        if (/sport|fitness|swimming|ice skating/i.test(keyword)) {
          category = "Sports Spot";
          badgeColor = "bg-success"; // green
        } else if (/craft|model|jewellery|cooking/i.test(keyword)) {
          category = "Craft Corner";
          badgeColor = "bg-purple"; // custom purple defined in CSS
        }

        const card = `
          <div class="carousel-item ${activeClass}">
            <div class="result-card d-flex flex-row align-items-center">
              <div class="image-wrapper flex-shrink-0">
                <img src="${photoUrl}" alt="${place.name} image" class="result-img" />
              </div>
              <div class="content-wrapper px-3">
                <span class="badge ${badgeColor} category-badge">${category}</span>
                <h3 class="result-title mt-2">${place.name}</h3>
                <p class="result-description">${place.vicinity || "Address not available"}</p>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  place.name
                )}" target="_blank" class="btn btn-dark btn-sm">Read more</a>
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
    });
  });
});
