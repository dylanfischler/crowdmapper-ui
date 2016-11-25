(function(window){
  function CrowdMapper() {
    this.map = null;
    this.locations = null;
    this.mapBounds = new google.maps.LatLngBounds();
  }

  CrowdMapper.prototype.intiateBasicMap = function(targetElement) {
    this.map = new google.maps.Map(targetElement, {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 3
    });

    // return new Promise(function(resolve, reject) {
    //   if (navigator.geolocation) {
    //     navigator.geolocation.getCurrentPosition(function(position){
    //       initMap({
    //         center: { lat: position.coords.latitude, lng: position.coords.longitude },
    //         zoom: 3
    //       });
    //       resolve();
    //     });
    //   } else {
    //     initMap({
    //       center: { lat: -34.397, lng: 150.644 },
    //       zoom: 3
    //     });
    //     resolve();
    //   }
    // });
  }

  CrowdMapper.prototype.getLocations = function() {
    var self = this;

    return new Promise(function(resolve, reject) {
      axios.get('/api/location').then(function(response) {
        self.locations = response.data;
        resolve();
      }).catch(function(error) {
        reject(error);
      });
    });
  }

  CrowdMapper.prototype.placeLocationMarkers = function() {
    console.log("Placing location markers");
    var self = this;
    this.locations.forEach(function(location) {
      var latLng = new google.maps.LatLng(location.lat, location.long);
      var marker = new google.maps.Marker({
        position: latLng,
        map: self.map
      });
      var markerWindow = new google.maps.InfoWindow({
        content: "Latitude: " + location.lat + " Longitude: " + location.long
      });
      marker.addListener('click', function() {
        markerWindow.open(self.map, marker);
      });
      self.mapBounds.extend(marker.position);
    });

    self.map.fitBounds(self.mapBounds);
  }

  CrowdMapper.prototype.generateHeatMap = function() {
    var data = [];
    this.locations.forEach(function(location) {
      var latLng = new google.maps.LatLng(location.lat, location.long);
      data.push(latLng);
    });

    this.heatMap = new google.maps.visualization.HeatmapLayer({
      data: data,
      dissipating: false,
      map: this.map
    });
  };

  window.CrowdMapper = CrowdMapper;
})(window);