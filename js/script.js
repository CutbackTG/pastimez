let map;
let userLocation;
let markers = [];
let activeInfoWindow = null;
let userMarker = null;

// Initialize map globally for Google Maps API callback
window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 50.266, lng: -5.052 },
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

        userMarker = new google.maps.Marker({
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
  const hobbyInput = document.getElementById("hobbyInput");
  const indoorOutdoor = document.getElementById("indoorOutdoor");
  const radiusInput = document.getElementById("radius");

  hobbyInput.addEventListener("blur", () => {
    if (hobbyInput.value.trim() !== "") {
      new bootstrap.Collapse(document.getElementById("collapsePreference"), { toggle: true });
    }
  });

  indoorOutdoor.addEventListener("change", () => {
    new bootstrap.Collapse(document.getElementById("collapseRadius"), { toggle: true });
  });

  radiusInput.addEventListener("blur", () => {
    if (radiusInput.value.trim() !== "") {
      radiusInput.closest("form").scrollIntoView({ behavior: "smooth", block: "end" });
    }
  });

  document.getElementById("searchForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // Clear all markers except the user marker
    markers.forEach((m) => m.setMap(null));
    markers = [];

    if (userMarker) {
      userMarker.setMap(map);
      markers.push(userMarker);
    }

    if (!userLocation) {
      alert("User location not available yet.");
      return;
    }

    const hobby = hobbyInput.value.trim();
    const preference = indoorOutdoor.value;
    const radiusMiles = parseInt(radiusInput.value);
    const radiusMeters = radiusMiles * 1609.34;

    if (!hobby || !radiusMiles || isNaN(radiusMiles)) {
      alert("Please complete all fields before searching.");
      return;
    }

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
    carouselInner.innerHTML = "";

    service.nearbySearch(request, (results, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results.length) {
        alert("No results found.");
        return;
      }

      const userLatLng = new google.maps.LatLng(userLocation.lat, userLocation.lng);

      results.sort((a, b) => {
        const d1 = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, a.geometry.location);
        const d2 = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, b.geometry.location);
        return d1 - d2;
      });

      results.forEach((place) => {
        const marker = new google.maps.Marker({
          map,
          position: place.geometry.location,
          title: place.name,
          icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        });

        markers.push(marker);

        const serviceDetails = new google.maps.places.PlacesService(map);

        serviceDetails.getDetails({ placeId: place.place_id }, (details, status) => {
          const websiteUrl = (status === google.maps.places.PlacesServiceStatus.OK && details.website)
            ? details.website
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;

          const photoUrl =
            place.photos && place.photos.length
              ? place.photos[0].getUrl({ maxWidth: 300, maxHeight: 200 })
              : "https://via.placeholder.com/300x200?text=No+Image";

          let category = "Hobby";
          let badgeColor = "bg-primary";

          if (/sport|fitness|swimming|ice skating/i.test(keyword)) {
            category = "Sports & Fitness";
          } else if (/craft|model|jewellery|cooking/i.test(keyword)) {
            category = "Crafting & Creativity";
          }

          const card = `
            <div class="carousel-item ${carouselInner.children.length === 0 ? 'active' : ''}">
              <div class="result-card d-flex flex-row align-items-center">
                <div class="image-wrapper flex-shrink-0">
                  <img src="${photoUrl}" alt="${place.name} image" class="result-img" />
                </div>
                <div class="content-wrapper px-3">
                  <span class="badge ${badgeColor} category-badge">${category}</span>
                  <h3 class="result-title mt-2">${place.name}</h3>
                  <p class="result-description">${place.vicinity || "Address not available"}</p>
                  <a href="${websiteUrl}" target="_blank" class="btn btn-dark btn-sm">Visit Website</a>
                </div>
              </div>
            </div>
          `;

          console.log("Appending card for:", place.name);
          carouselInner.insertAdjacentHTML("beforeend", card);

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="max-width: 200px;">
                <strong>${place.name}</strong><br/>
                ${place.vicinity || ""}<br/>
                <a href="${websiteUrl}" target="_blank">Website</a>
              </div>
            `,
          });

          marker.addListener("click", () => {
            if (activeInfoWindow) activeInfoWindow.close();
            infoWindow.open(map, marker);
            activeInfoWindow = infoWindow;
          });
        });
      });
    });
  });
});
