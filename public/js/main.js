(function(window){
  function CrowdMapper() {
    this.map = null;
    this.locations = null;
    this.clusters = null;
    this.mapBounds = new google.maps.LatLngBounds();
  }

  CrowdMapper.prototype.intiateBasicMap = function(targetElement) {
    this.map = new google.maps.Map(targetElement, {
      center: { lat: 42.390238, lng: -72.524853 },
      zoom: 3
    });
  }

  CrowdMapper.prototype.getLocations = function() {
    var self = this;

    return new Promise(function(resolve, reject) {
      axios.get('/api/location').then(function(response) {
        self.locations = response.data;
        console.log(self.locations);
        // self.placeLocationMarkers(self.locations);
        resolve();
      }).catch(function(error) {
        reject(error);
      });
    });
  }

  CrowdMapper.prototype.getClusters = function() {
    var self = this;

    return new Promise(function(resolve, reject) {
      axios.get('/api/clusters').then(function(response) {
        self.clusters = response.data;
        self.drawClusters();
        resolve();
      }).catch(function(error) {
        reject(error);
      });
    });
  }

  CrowdMapper.prototype.placeLocationMarkers = function(locations) {
    console.log("Placing location markers");
    var self = this;
    locations.forEach(function(location) {
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

  CrowdMapper.prototype.drawClusters = function() {
    var self = this;

    for(var cluster in self.clusters) {
      var color = getRandomColor()
      var points = self.clusters[cluster].points;
      points.forEach(function(location) {
        var latLng = new google.maps.LatLng(location[0], location[1]);
        var marker = new google.maps.Marker({
          position: latLng,
          map: self.map,
          // label: cluster,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            strokeColor: color,
            fillColor: color,
            fillOpacity: 1,
            scale: 5
          }
        });
        self.mapBounds.extend(marker.position);
      });
    }

    self.map.fitBounds(self.mapBounds);
  }

  CrowdMapper.prototype.drawClusterHulls = function() {
    console.log("Drawing clusters", this.clusters);
    // TODO: do this

    // for each cluster
      // draw hull polygon
      // call self.placeLocationMarkers on hull
    
    for(var cluster in this.clusters) {
      var currentHull = this.clusters[cluster].hull;
      var clusterCoords = [];
      var locations = [];
      for(var latLong in currentHull){
        locations.push({lat: currentHull[latLong][0], long: currentHull[latLong][1]});
        clusterCoords.push({lat: currentHull[latLong][0], lng: currentHull[latLong][1]});
      }
      var color = getRandomColor();
      var newCluster = new google.maps.Polygon({
          paths: clusterCoords,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: color,
          fillOpacity: 0.35
        });
      console.log(color);
      console.log(getRandomColor());
      newCluster.setMap(this.map);
      this.placeLocationMarkers(locations);
    }
    
  }
  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

  CrowdMapper.prototype.generateHeatMap = function() {
    var self = this;
    var data = [];
    self.locations.forEach(function(location) {
      var latLng = new google.maps.LatLng(location.lat, location.long);
      data.push(latLng);
    });

    self.heatMap = new google.maps.visualization.HeatmapLayer({
      data: data,
      dissipating: false,
      map: self.map
    });
  };

  window.CrowdMapper = CrowdMapper;
})(window);