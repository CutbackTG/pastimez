// Global variables
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
  const categorySelect = document.getElementById("categorySelect");
  const carouselInner = document.getElementById("carouselInner");

  // Utility: Clear all markers except userMarker
  function clearMarkers() {
    markers.forEach((m) => m.setMap(null));
    markers = [];
    if (userMarker) {
      userMarker.setMap(map);
      markers.push(userMarker);
    }
  }

  // Utility: Lighten a hex color by factor (0 to 1)
  function lightenHexColor(hex, factor) {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Calculate lightened color
    const nr = Math.min(255, Math.floor(r + (255 - r) * factor));
    const ng = Math.min(255, Math.floor(g + (255 - g) * factor));
    const nb = Math.min(255, Math.floor(b + (255 - b) * factor));

    return `rgb(${nr}, ${ng}, ${nb})`;
  }

  // Accordion styling with fixed lighten color function
  function styleAccordionItem(accordionItem, bgColor, textColor, imgUrl) {
    const button = accordionItem.querySelector(".accordion-button");
    const body = accordionItem.querySelector(".accordion-body");

    button.style.backgroundColor = bgColor;
    button.style.color = textColor;
    button.style.fontWeight = "700";
    button.style.borderRadius = "0.5rem";
    button.style.border = "none";

    body.style.display = "flex";
    body.style.alignItems = "center";
    body.style.gap = "30px";
    body.style.backgroundColor = lightenHexColor(bgColor, 0.7);
    body.style.padding = "1rem";
    body.style.borderRadius = "0 0 0.5rem 0.5rem";

    const label = body.querySelector("label");
    const input = body.querySelector("input, select");

    label.style.flex = "1 0 30%";
    label.style.marginBottom = "0";
    label.style.color = textColor;
    label.style.fontWeight = "600";

    input.style.flex = "1 0 70%";
    input.style.maxWidth = "400px";
    input.style.width = "100%";
    input.style.padding = "0.5rem";
    input.style.border = `1px solid ${textColor}`;
    input.style.borderRadius = "0.3rem";
    input.style.boxSizing = "border-box";

    let img = accordionItem.querySelector(".accordion-image");
    if (!img) {
      img = document.createElement("img");
      img.classList.add("accordion-image");
      img.style.width = "60px";
      img.style.height = "60px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "8px";
      img.style.marginRight = "10px";
      body.insertBefore(img, label);
    }
    img.src = imgUrl;
    img.alt = "Icon related to step";
  }

  // Event listeners for form interactivity
  hobbyInput.addEventListener("blur", () => {
    if (hobbyInput.value.trim() !== "") {
      new bootstrap.Collapse(document.getElementById("collapsePreference"), {
        toggle: true,
      });
    }
  });

  indoorOutdoor.addEventListener("change", () => {
    new bootstrap.Collapse(document.getElementById("collapseRadius"), {
      toggle: true,
    });
  });

  // Main form submission event
  document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();

    clearMarkers();

    if (!userLocation) {
      alert("User location not available yet.");
      return;
    }

    const hobby = hobbyInput.value.trim();
    const category = categorySelect.value;
    const preference = indoorOutdoor.value;
    const radiusMiles = parseInt(radiusInput.value);
    if ((!hobby && !category) || !radiusMiles || isNaN(radiusMiles)) {
      alert("Please provide either a hobby or a category, and specify distance.");
      return;
    }
    const radiusMeters = radiusMiles * 1609.34;

    const bounds = new google.maps.LatLngBounds();
      results.forEach((place) => bounds.extend(place.geometry.location));
      map.fitBounds(bounds);

    // Build keyword string
    let keyword = "";
    if (hobby) {
      keyword = hobby;
      if (preference === "indoor") keyword += " indoor club";
      else if (preference === "outdoor") keyword += " outdoor club";
      else keyword += " club";
    } else {
      const categoryKeywords = {
        sports: "sports club",
        crafting: "crafts club",
        music: "music group",
        gaming: "gaming club",
        social: "community group",
        outdoors: "outdoor adventure club",
      };
      keyword = categoryKeywords[category] || "hobby club";
    }

    const service = new google.maps.places.PlacesService(map);
    const request = {
      location: userLocation,
      radius: radiusMeters,
      keyword,
    };

    carouselInner.innerHTML = "";

    service.nearbySearch(request, (results, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results.length) {
        alert("No results found.");
        return;
      }

      const userLatLng = new google.maps.LatLng(userLocation.lat, userLocation.lng);

      // Sort results by distance from user
      results.sort((a, b) => {
        const d1 = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, a.geometry.location);
        const d2 = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, b.geometry.location);
        return d1 - d2;
      });

      // Limit results to 10 for performance
      results.slice(0, 10).forEach((place, index) => {
        const marker = new google.maps.Marker({
          map,
          position: place.geometry.location,
          title: place.name,
          icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        });
        markers.push(marker);

        service.getDetails({ placeId: place.place_id }, (details, status) => {
          const websiteUrl =
            status === google.maps.places.PlacesServiceStatus.OK && details.website
              ? details.website
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;

          const photoUrl =
            place.photos && place.photos.length
              ? place.photos[0].getUrl({ maxWidth: 300, maxHeight: 200 })
              : "https://via.placeholder.com/300x200?text=No+Image";

          // Categorize badges more broadly
          let categoryLabel = "Hobby";
          let badgeColor = "bg-primary";

          if (/sport|fitness|swimming|ice skating/i.test(keyword)) {
            categoryLabel = "Sports & Fitness";
            badgeColor = "bg-success";
          } else if (/craft|model|jewellery|cooking/i.test(keyword)) {
            categoryLabel = "Crafting & Creativity";
            badgeColor = "bg-warning text-dark";
          } else if (/music/i.test(keyword)) {
            categoryLabel = "Music";
            badgeColor = "bg-info text-white";
          } else if (/gaming/i.test(keyword)) {
            categoryLabel = "Gaming";
            badgeColor = "bg-danger";
          } else if (/social|community/i.test(keyword)) {
            categoryLabel = "Social";
            badgeColor = "bg-secondary";
          } else if (/outdoor/i.test(keyword)) {
            categoryLabel = "Outdoors";
            badgeColor = "bg-success";
          }

          const card = `
            <div class="carousel-item${index === 0 ? " active" : ""}">
              <div class="result-card d-flex flex-row align-items-center">
                <div class="image-wrapper flex-shrink-0">
                  <img src="${photoUrl}" alt="${place.name} image" class="result-img" />
                </div>
                <div class="content-wrapper px-3">
                  <span class="badge ${badgeColor} category-badge">${categoryLabel}</span>
                  <h3 class="result-title mt-2">${place.name}</h3>
                  <p class="result-description">${place.vicinity || "Address not available"}</p>
                  <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-dark btn-sm">Visit Website</a>
                </div>
              </div>
            </div>
          `;

          carouselInner.insertAdjacentHTML("beforeend", card);

          if (index === 0) {
            document.getElementById("resultsCarouselWrapper").scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="max-width: 400px;">
                <strong>${place.name}</strong><br/>
                ${place.vicinity || ""}<br/>
                <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer">Website</a>
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

  // Apply accordion styling
  const accordionItems = document.querySelectorAll(".accordion-item");
  const basePurple = "#6a1b9a";

  accordionItems.forEach((item, i) => {
    let imgUrl = "";
    switch (i) {
      case 0:
        imgUrl = "assets/images/icons/hobby.png";
        break;
      case 1:
        imgUrl = "assets/images/icons/location.png";
        break;
      case 2:
        imgUrl = "assets/images/icons/distance.png";
        break;
      case 3:
        imgUrl = "assets/images/icons/category.png";
        break;
    }
    styleAccordionItem(item, basePurple, "#ffffff", imgUrl);
  });

  // Fix container styles - corrected border and fontWeight
  const container = document.querySelector(".opening");
  if (container) {
    container.style.borderWidth = "4px";
    container.style.borderStyle = "solid";
    container.style.borderColor = basePurple;
    container.style.padding = "20px";
    container.style.backgroundColor = basePurple;
    container.style.color = "white";
    container.style.fontWeight = "800"; // numeric fontWeight is correct
  }
});
