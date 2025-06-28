let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 50.266, lng: -5.052 }, // Cornwall
    zoom: 10
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(userLocation);
      new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "You are here"
      });
    });
  }
}
