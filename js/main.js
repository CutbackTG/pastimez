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
  // DOM elements
  const hobbyInput = document.getElementById("hobbyInput");
  const indoorOutdoor = document.getElementById("indoorOutdoor");
  const radiusInput = document.getElementById("radius");
  const categorySelect = document.getElementById("categorySelect");
  const carouselInner = document.getElementById("carouselInner");
  const tagContainer = document.getElementById("interest-tags");
  const hobbyContainer = document.getElementById("hobby-results");
  const hobbyWrapper = document.getElementById("hobby-results-wrapper");

  // Interest tags and hobby list
  const interests = ["Creative", "Tech", "Physical", "Social", "Nature", "Relaxing"];
  const hobbies = [
    {
      name: "Painting",
      tags: ["Creative"],
      description: "Explore your creativity with colours and brushstrokes.",
    },
    {
      name: "Coding",
      tags: ["Tech"],
      description: "Create websites, apps, or games while learning programming.",
    },
    {
      name: "Hiking",
      tags: ["Nature", "Physical"],
      description: "Connect with nature and stay fit.",
    },
    {
      name: "Chess",
      tags: ["Relaxing", "Tech"],
      description: "Sharpen your mind with this strategic board game.",
    },
    {
      name: "Dancing",
      tags: ["Physical", "Social"],
      description: "Move to the rhythm and connect with others.",
    },
    {
      name: "Photography",
      tags: ["Creative", "Nature"],
      description: "Capture moments and scenery artistically.",
    },
  ];

  document.addEventListener("DOMContentLoaded", () => {
    const interests = [
      "Creative",
      "Tech",
      "Physical",
      "Social",
      "Nature",
      "Relaxing",
    ];
    const hobbies = [
      {
        name: "Painting",
        tags: ["Creative"],
        description: "Explore your creativity with colours and brushstrokes.",
      },
      {
        name: "Coding",
        tags: ["Tech"],
        description:
          "Create websites, apps, or games while learning programming.",
      },
      {
        name: "Hiking",
        tags: ["Nature", "Physical"],
        description: "Connect with nature and stay fit.",
      },
      {
        name: "Chess",
        tags: ["Relaxing", "Tech"],
        description: "Sharpen your mind with this strategic board game.",
      },
      {
        name: "Dancing",
        tags: ["Physical", "Social"],
        description: "Move to the rhythm and connect with others.",
      },
      {
        name: "Photography",
        tags: ["Creative", "Nature"],
        description: "Capture moments and scenery artistically.",
      },
      // Add more as needed
    ];

    const tagContainer = document.getElementById("interest-tags");
    const hobbyContainer = document.getElementById("hobby-results");

    // Render tags
    interests.forEach((interest) => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = interest;
      tag.onclick = () => {
        tag.classList.toggle("active");
        updateResults();
      };
      tagContainer.appendChild(tag);
    });

    function updateResults() {
      const activeTags = [...document.querySelectorAll(".tag.active")].map(
        (tag) => tag.textContent
      );
      hobbyContainer.innerHTML = "";

      if (activeTags.length === 0) {
        hobbyContainer.style.display = "none"; // hide results
        return;
      }

      const filtered = hobbies.filter((hobby) =>
        hobby.tags.some((tag) => activeTags.includes(tag))
      );

      hobbyContainer.style.display = "flex"; // show results

      if (filtered.length === 0) {
        hobbyContainer.innerHTML =
          "<p class='text-center'>No hobbies match your selected interests.</p>";
        return;
      }

      filtered.forEach((hobby) => {
        const col = document.createElement("div");
        col.className = "col";

        const card = document.createElement("div");
        card.className = "card h-100 shadow-sm";

        const body = document.createElement("div");
        body.className = "card-body";

        const title = document.createElement("h5");
        title.className = "card-title";
        title.textContent = hobby.name;

        const desc = document.createElement("p");
        desc.className = "card-text";
        desc.textContent = hobby.description;

        body.appendChild(title);
        body.appendChild(desc);
        card.appendChild(body);
        col.appendChild(card);
        hobbyContainer.appendChild(col);
      });
    }

    updateResults(); // initial render
  });

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
    body.style.gap = "20px";
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

  // Helper to show validation error messages
  function showError(input, message) {
    let errorEl = document.createElement("div");
    errorEl.className = "error-message text-danger small mt-1";
    errorEl.textContent = message;
    input.parentElement.appendChild(errorEl);
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

  // Main form submission event with validation
  document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();

    // Remove previous error messages
    document.querySelectorAll(".error-message").forEach((el) => el.remove());

    const hobby = hobbyInput.value.trim();
    const category = categorySelect.value;
    const preference = indoorOutdoor.value;
    const radiusVal = radiusInput.value.trim();

    let valid = true;

    // Validation 1: Require hobby OR category
    if (!hobby && !category) {
      showError(hobbyInput, "Please enter a hobby or select a category.");
      showError(categorySelect, "Please enter a hobby or select a category.");
      valid = false;
    }

    // Validation 2: Require indoor/outdoor preference
    if (!preference) {
      showError(indoorOutdoor, "Please select indoor or outdoor preference.");
      valid = false;
    }

    // Validation 3: Radius must be empty or number between 1 and 100
    if (radiusVal) {
      const radiusNum = Number(radiusVal);
      if (isNaN(radiusNum) || radiusNum < 1 || radiusNum > 100) {
        showError(radiusInput, "Distance must be a number between 1 and 100.");
        valid = false;
      }
    }

    if (!valid) {
      return; // Stop submission if invalid
    }

    clearMarkers();

    if (!userLocation) {
      alert("User location not available yet.");
      return;
    }

    const radiusMiles = radiusVal ? parseInt(radiusVal) : 100; // Default to 100 if empty

    const radiusMeters = radiusMiles * 1609.34;

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
      if (
        status !== google.maps.places.PlacesServiceStatus.OK ||
        !results.length
      ) {
        alert("No results found.");
        return;
      }

      const userLatLng = new google.maps.LatLng(
        userLocation.lat,
        userLocation.lng
      );

      // Sort results by distance from user
      results.sort((a, b) => {
        const d1 = google.maps.geometry.spherical.computeDistanceBetween(
          userLatLng,
          a.geometry.location
        );
        const d2 = google.maps.geometry.spherical.computeDistanceBetween(
          userLatLng,
          b.geometry.location
        );
        return d1 - d2;
      });

      // Limit results to 20 for performance
      results.slice(0, 20).forEach((place, index) => {
        const marker = new google.maps.Marker({
          map,
          position: place.geometry.location,
          title: place.name,
          icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        });
        markers.push(marker);

        service.getDetails({ placeId: place.place_id }, (details, status) => {
          const websiteUrl =
            status === google.maps.places.PlacesServiceStatus.OK &&
            details.website
              ? details.website
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  place.name
                )}`;

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
            categoryLabel = "Music & Performing Arts";
            badgeColor = "bg-info text-white";
          } else if (/gaming/i.test(keyword)) {
            categoryLabel = "Gaming";
            badgeColor = "bg-danger";
          } else if (/social|community/i.test(keyword)) {
            categoryLabel = "Social & Community";
            badgeColor = "bg-secondary";
          } else if (/outdoor/i.test(keyword)) {
            categoryLabel = "Outdoor Activities";
            badgeColor = "bg-dark";
          }

          // Add to carousel
          const activeClass = index === 0 ? "active" : "";
          carouselInner.innerHTML += `
            <div class="carousel-item ${activeClass}">
              <div class="d-flex flex-column flex-sm-row align-items-center">
                <img src="${photoUrl}" alt="${
            place.name
          }" class="d-block me-sm-3 mb-3 mb-sm-0" style="max-width: 300px; height: auto; border-radius: 8px;">
                <div>
                  <h5>${place.name}</h5>
                  <p>${place.vicinity || place.formatted_address || ""}</p>
                  <span class="badge ${badgeColor}">${categoryLabel}</span>
                  <br />
                  <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer">Visit website</a>
                </div>
              </div>
            </div>`;

          // Add click listener for marker info window
          marker.addListener("click", () => {
            if (activeInfoWindow) activeInfoWindow.close();

            const contentString = `
              <div>
                <h6>${place.name}</h6>
                <p>${place.vicinity || place.formatted_address || ""}</p>
                <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer">Visit website</a>
              </div>`;

            activeInfoWindow = new google.maps.InfoWindow({
              content: contentString,
            });
            activeInfoWindow.open(map, marker);
          });
        });
      });

      // Show carousel if hidden
      const carouselElement = document.getElementById(
        "carouselExampleControls"
      );
      if (carouselElement) {
        carouselElement.style.display = "block";
      }
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
    container.style.fontWeight = "800";
  }
});
