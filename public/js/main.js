(function(window){
  function CrowdMapper() {
    this.map = null;
    this.locations = null;
    this.clusters = null;
    this.markers = [];
    this.mapBounds = new google.maps.LatLngBounds();
    this.curves = null;
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

  CrowdMapper.prototype.getCurves = function() {
    var self = this;

    return new Promise(function(resolve, reject) {
      axios.get('/api/curves').then(function(response) {
        self.curves = response.data;
        self.drawCurves();
        resolve();
      }).catch(function(error) {
        reject(error);
      });
    });
  }

  function calcDistance(locationOne, locationTwo){
    var radius = 6378137;   // approximate Earth radius, *in meters*
        var deltaLat = locationOne[0] - locationTwo[0];
        var deltaLon = locationOne[1] - locationTwo[1];
        var angle = 2 * Math.asin( Math.sqrt(
        Math.pow(Math.sin(deltaLat/2), 2) + 
        Math.cos(locationTwo[0]) * Math.cos(locationOne[0]) * 
        Math.pow(Math.sin(deltaLon/2), 2) ) );
        return radius * angle;
  }

  CrowdMapper.prototype.drawCurves = function() {
    var self = this;
    self.clearMarkers();
    self.mapBounds = new google.maps.LatLngBounds();
    for(curve in self.curves){
      var path = [];
      var lastLat = 0;
      var lastLng = 0;
      var lastPoint = [0,0];
      self.curves[curve].sort(function(locationOne, locationTwo){
        // if((locationOne[0] - locationTwo[0]) > 0){
        //   if( (locationOne[1] - locationTwo[1]) > 0 ){
        //     return 1;
        //   }
        // }
        // else{
        //   if( (locationOne[1] - locationTwo[1]) < 0 ){
        //     return -1;
        //   }
        // }
        // return -(locationOne[0] - locationTwo[0]) + (locationOne[1] - locationTwo[1]);
        var aDist = calcDistance(locationOne, lastPoint) ;
        var bDist = calcDistance(locationTwo, lastPoint) ;
        // console.log("aDist: "+aDist+" , bDist: "+bDist);
        if(aDist - bDist > 0.0){
          lastPoint = locationTwo;
          return 1;
        }
        else{
          lastPoint = locationOne;
          return -1;
        }
        return 0;
      });
      self.curves[curve].forEach(function(location) {
        if(location[0] != null){
          // if(Math.abs(lastLat - location[0]) > 0.00001 && Math.abs(lastLng - location[1]) > 0.00001){
            var latLng = new google.maps.LatLng(location[0], location[1]);
            path.push(latLng);
            // var marker = new google.maps.Marker({
            //   position: latLng,
            //   map: self.map
            // });
            // self.markers.push(marker)
            self.mapBounds.extend(latLng);
            lastLat = location[0];
            lastLng = location[1];
          // }
        }
      });

      var newPath = new google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: getRandomColor(),
          strokeOpacity: 1.0,
          strokeWeight: 2,
          fillOpacity: 0.0
        });
      newPath.setMap(self.map);
    }

    self.map.fitBounds(self.mapBounds);
  }

  CrowdMapper.prototype.getClusters = function() {
    var self = this;

    return new Promise(function(resolve, reject) {
      axios.get('/api/clusters').then(function(response) {
        self.clusters = response.data;
        self.applyClusters();
        // self.drawClusters();
        resolve();
      }).catch(function(error) {
        reject(error);
      });
    });
  }

  CrowdMapper.prototype.applyClusters = function() {
    var clusterSelect = document.getElementById('cluster-select');
    clusterSelect.innerHTML = '<option selected disabled>Select a cluster</option>';

    for(var cluster in this.clusters) {
      var opt = document.createElement('option');
      opt.text = cluster;
      opt.value = cluster;
      clusterSelect.appendChild(opt);
    }
  }

  CrowdMapper.prototype.renderCluster = function(clusterKey) {
    var self = this;
    self.clearMarkers();
    self.mapBounds = new google.maps.LatLngBounds();

    self.clusters[clusterKey].points.forEach(function(location) {
      var latLng = new google.maps.LatLng(location[0], location[1]);
      var marker = new google.maps.Marker({
        position: latLng,
        map: self.map
      });
      self.markers.push(marker)
      self.mapBounds.extend(marker.position);
    });

    self.map.fitBounds(self.mapBounds);
  }

  CrowdMapper.prototype.clearMarkers = function() {
    this.markers.forEach(function(marker) {
      marker.setMap(null);
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
      var color = getRandomColor();
      var points = self.clusters[cluster].hull;
      points.forEach(function(location) {
        var latLng = new google.maps.LatLng(location[0], location[1]);
        var marker = new google.maps.Marker({
          position: latLng,
          map: self.map,
          label: cluster,
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