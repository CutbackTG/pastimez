(() => {
  'use strict';

  // ----------------- Constants -----------------
  const MAX_DISCOVER = 12;
  const INTERESTS = ['Creative', 'Tech', 'Physical', 'Social', 'Nature', 'Relaxing'];
  const BASE_PURPLE = '#6a1b9a';

  // ----------------- Globals -----------------
  let map;
  let userLocation;
  let markers = [];
  let userMarker = null;
  let activeInfoWindow = null;
  let discoverResults = [];

  // ----------------- Utilities -----------------
  const clearMarkers = () => {
    markers.forEach(m => m.setMap(null));
    markers = [];
    if (userMarker) {
      userMarker.setMap(map);
      markers.push(userMarker);
    }
  };

  const lightenHexColor = (hex, factor) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const nr = Math.min(255, Math.floor(r + (255 - r) * factor));
    const ng = Math.min(255, Math.floor(g + (255 - g) * factor));
    const nb = Math.min(255, Math.floor(b + (255 - b) * factor));
    return `rgb(${nr}, ${ng}, ${nb})`;
  };

  const styleAccordionItem = (item, bgColor, textColor, imgUrl) => {
    const button = item.querySelector('.accordion-button');
    const body = item.querySelector('.accordion-body');

    button.style.backgroundColor = bgColor;
    button.style.color = textColor;
    button.style.fontWeight = '700';
    button.style.border = 'none';
    button.style.borderRadius = '0.5rem';

    body.style.display = 'flex';
    body.style.alignItems = 'center';
    body.style.gap = '20px';
    body.style.padding = '1rem';
    body.style.borderRadius = '0 0 0.5rem 0.5rem';
    body.style.backgroundColor = lightenHexColor(bgColor, 0.7);

    const label = body.querySelector('label');
    const input = body.querySelector('input, select');

    if (label) {
      label.style.flex = '1 0 30%';
      label.style.marginBottom = '0';
      label.style.color = textColor;
      label.style.fontWeight = '600';
    }

    if (input) {
      input.style.flex = '1 0 70%';
      input.style.maxWidth = '400px';
      input.style.width = '100%';
      input.style.padding = '0.5rem';
      input.style.border = `1px solid ${textColor}`;
      input.style.borderRadius = '0.3rem';
      input.style.boxSizing = 'border-box';
    }

    let img = item.querySelector('.accordion-image');
    if (!img) {
      img = document.createElement('img');
      img.className = 'accordion-image';
      img.style.width = '60px';
      img.style.height = '60px';
      img.style.objectFit = 'cover';
      img.style.marginRight = '10px';
      img.style.borderRadius = '8px';
      body.insertBefore(img, label);
    }
    img.src = imgUrl;
    img.alt = 'Icon';
  };

  // ----------------- Discover Helpers -----------------
  const mapPlaceToTags = place => {
    const text = (place.name + ' ' + (place.types || []).join(' ')).toLowerCase();
    const tags = [];

    const match = (regex, tag) => { if (regex.test(text)) tags.push(tag); };

    match(/art|gallery|painting|craft/, 'Creative');
    match(/tech|computer|electronics|coding|software|maker/, 'Tech');
    match(/gym|sport|fitness|dance|run|hike|climb|yoga|swim/, 'Physical');
    match(/park|garden|outdoor|nature|trail/, 'Nature');
    match(/community|club|social|bar|pub|cafe/, 'Social');
    match(/spa|relax|massage|meditat|library/, 'Relaxing');

    if (tags.length === 0) tags.push('Creative');
    return tags;
  };

  const renderDiscoverResults = () => {
    const container = document.getElementById('discover-results');
    if (!container) return;

    const activeTags = [...document.querySelectorAll('.interest-tag.active')].map(t => t.textContent);
    container.innerHTML = '';

    const filtered = activeTags.length === 0 ? discoverResults : discoverResults.filter(p => p.tags.some(t => activeTags.includes(t)));

    if (filtered.length === 0) {
      container.innerHTML = '<p class="text-center">No clubs match your selected interests.</p>';
      return;
    }

    filtered.forEach(place => {
      const col = document.createElement('div');
      col.className = 'col';

      const card = document.createElement('div');
      card.className = 'card h-100 shadow-sm';

      const img = document.createElement('img');
      img.className = 'card-img-top';
      img.style.objectFit = 'cover';
      img.style.height = '200px';
      img.src = place.photo || 'https://via.placeholder.com/300x200?text=No+Image';
      img.alt = place.name;

      const body = document.createElement('div');
      body.className = 'card-body';

      const title = document.createElement('h5');
      title.className = 'card-title';
      title.textContent = place.name;

      const address = document.createElement('p');
      address.className = 'card-text';
      address.textContent = place.address;

      body.appendChild(title);
      body.appendChild(address);
      card.appendChild(img);
      card.appendChild(body);
      col.appendChild(card);

      container.appendChild(col);
    });
  };

  const loadDiscoverResults = location => {
    const service = new google.maps.places.PlacesService(map);
    const request = { location, radius: 16093, keyword: 'hobby club' }; // 10 miles

    service.nearbySearch(request, (results, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results.length) {
        console.warn('No default results found.');
        return;
      }

      const userLatLng = new google.maps.LatLng(location.lat, location.lng);
      results.sort((a, b) => {
        const d1 = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, a.geometry.location);
        const d2 = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, b.geometry.location);
        return d1 - d2;
      });

      discoverResults = results.slice(0, MAX_DISCOVER).map(place => ({
        name: place.name,
        address: place.vicinity || place.formatted_address || '',
        photo: place.photos && place.photos.length ? place.photos[0].getUrl({ maxWidth: 300, maxHeight: 200 }) : null,
        tags: mapPlaceToTags(place)
      }));

      renderDiscoverResults();
    });
  };

  // ----------------- Google Map -----------------
  window.initMap = () => {
    map = new google.maps.Map(document.getElementById('map'), { center: { lat: 50.266, lng: -5.052 }, zoom: 10 });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          map.setCenter(userLocation);

          userMarker = new google.maps.Marker({ position: userLocation, map, title: 'You are here', icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' } });
          markers.push(userMarker);

          loadDiscoverResults(userLocation);
        },
        () => {
          console.warn('Geolocation failed; using fallback.');
          loadDiscoverResults({ lat: 50.266, lng: -5.052 });
        }
      );
    } else {
      loadDiscoverResults({ lat: 50.266, lng: -5.052 });
    }
  };

  // ----------------- DOM Ready -----------------
  document.addEventListener('DOMContentLoaded', () => {
    // Interest Tags --------------------
    const tagContainer = document.getElementById('interest-tags');
    if (tagContainer) {
      INTERESTS.forEach(int => {
        const tag = document.createElement('span');
        tag.className = 'interest-tag tag active';
        tag.textContent = int;
        tag.onclick = () => {
          tag.classList.toggle('active');
          renderDiscoverResults();
        };
        tagContainer.appendChild(tag);
      });
    }

    renderDiscoverResults(); // initial empty render

    // Back to top --------------------
    const backToTopBtn = document.getElementById('backToTopBtn');
    window.addEventListener('scroll', () => { backToTopBtn.style.display = window.scrollY > 100 ? 'block' : 'none'; });
    backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Accordion styling --------------
    document.querySelectorAll('.accordion-item').forEach((item, idx) => {
      const icons = ['hobby', 'location', 'distance', 'category'];
      styleAccordionItem(item, BASE_PURPLE, '#fff', `assets/images/icons/${icons[idx]}.png`);
    });

    // ----------------- Form Logic -----------------
    const hobbyInput = document.getElementById('hobbyInput');
    const indoorOutdoor = document.getElementById('indoorOutdoor');
    const radiusInput = document.getElementById('radius');
    const categorySelect = document.getElementById('categorySelect');
    const carouselInner = document.getElementById('carouselInner');
    const hobbyContainer = document.getElementById('hobby-results');
    const searchForm = document.getElementById('searchForm');

    // Helper to show validation errors
    const showError = (input, message) => {
      if (!input) return;
      // Avoid duplicating error messages
      if (input.parentElement.querySelector('.error-message')) return;
      const err = document.createElement('div');
      err.className = 'error-message text-danger small mt-1';
      err.textContent = message;
      input.parentElement.appendChild(err);
    };

    // Perform the Places search
    const performSearch = ({ hobby, category, preference, radiusMiles }) => {
      if (!userLocation) {
        alert('User location not available yet.');
        return;
      }

      const radiusMeters = radiusMiles * 1609.34;
      let keyword = '';

      if (hobby) {
        keyword = hobby;
        keyword += preference === 'indoor' ? ' indoor club' : preference === 'outdoor' ? ' outdoor club' : ' club';
      } else {
        const categoryKeywords = {
          sports: 'sports club',
          crafting: 'crafts club',
          music: 'music group',
          gaming: 'gaming club',
          social: 'community group',
          outdoors: 'outdoor adventure club'
        };
        keyword = categoryKeywords[category] || 'hobby club';
      }

      const service = new google.maps.places.PlacesService(map);
      const request = { location: userLocation, radius: radiusMeters, keyword };

      // Clear previous UI
      clearMarkers();
      carouselInner.innerHTML = '';
      hobbyContainer.innerHTML = '';

      service.nearbySearch(request, (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results.length) {
          alert('No results found.');
          return;
        }

        const userLatLng = new google.maps.LatLng(userLocation.lat, userLocation.lng);
        results.sort((a, b) => {
          const d1 = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, a.geometry.location);
          const d2 = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, b.geometry.location);
          return d1 - d2;
        });

        // Render grid & carousel max 12
        results.slice(0, 12).forEach((place, idx) => {
          // Card
          const photoUrl = place.photos && place.photos.length ? place.photos[0].getUrl({ maxWidth: 300, maxHeight: 200 }) : 'https://via.placeholder.com/300x200?text=No+Image';
          const col = document.createElement('div');
          col.className = 'col';
          const card = document.createElement('div');
          card.className = 'card h-100 shadow-sm';
          const img = document.createElement('img');
          img.src = photoUrl;
          img.alt = place.name;
          img.className = 'card-img-top';
          img.style.objectFit = 'cover';
          img.style.height = '200px';
          const body = document.createElement('div');
          body.className = 'card-body';
          const title = document.createElement('h5');
          title.className = 'card-title';
          title.textContent = place.name;
          const addressP = document.createElement('p');
          addressP.className = 'card-text';
          addressP.textContent = place.vicinity || place.formatted_address || '';
          body.appendChild(title);
          body.appendChild(addressP);
          card.appendChild(img);
          card.appendChild(body);
          col.appendChild(card);
          hobbyContainer.appendChild(col);

          // Marker
          const marker = new google.maps.Marker({ map, position: place.geometry.location, title: place.name, icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' });
          markers.push(marker);

          // InfoWindow
          marker.addListener('click', () => {
            if (activeInfoWindow) activeInfoWindow.close();
            const contentString = `<div><h6>${place.name}</h6><p>${place.vicinity || place.formatted_address || ''}</p><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}" target="_blank">View on Google Maps</a></div>`;
            activeInfoWindow = new google.maps.InfoWindow({ content: contentString });
            activeInfoWindow.open(map, marker);
          });

          // Carousel
          const activeClass = idx === 0 ? 'active' : '';
          carouselInner.innerHTML += `<div class="carousel-item ${activeClass}"><div class="d-flex flex-column flex-sm-row align-items-center"><img src="${photoUrl}" class="d-block me-sm-3 mb-3 mb-sm-0" style="max-width:300px;height:auto;border-radius:8px;"><div><h5>${place.name}</h5><p>${place.vicinity || ''}</p><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}" target="_blank">View on Google Maps</a></div></div></div>`;
        });

        // Show carousel
        const carouselElement = document.getElementById('carouselExampleControls');
        if (carouselElement) carouselElement.style.display = 'block';
      });
    };

    // Form submission handler
    if (searchForm) {
      searchForm.addEventListener('submit', e => {
        e.preventDefault();
        // Remove old errors
        document.querySelectorAll('.error-message').forEach(el => el.remove());

        const hobby = hobbyInput.value.trim();
        const category = categorySelect.value;
        const preference = indoorOutdoor.value;
        const radiusVal = radiusInput.value.trim();

        let valid = true;

        if (!hobby && !category) {
          showError(hobbyInput, 'Enter a hobby or select a category.');
          showError(categorySelect, 'Enter a hobby or select a category.');
          valid = false;
        }
        if (!preference) {
          showError(indoorOutdoor, 'Select indoor or outdoor preference.');
          valid = false;
        }
        const radiusMiles = radiusVal ? Number(radiusVal) : 100;
        if (radiusVal && (isNaN(radiusMiles) || radiusMiles < 1 || radiusMiles > 100)) {
          showError(radiusInput, 'Distance must be between 1 and 100 miles.');
          valid = false;
        }

        if (!valid) return;

        performSearch({ hobby, category, preference, radiusMiles });
      });
    }
  });
})();
