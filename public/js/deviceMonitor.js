(function(window){
  function DeviceMonitor() {
    this.devices = [];
  }

  DeviceMonitor.prototype.refresh = function() {
    var self = this;

    return new Promise(function(resolve, reject) {
      axios.get('/monitor').then(function(response) {
        self.devices = response.data;
        resolve();
      }).catch(function(error) {
        reject(error);
      });
    });
  }

  window.DeviceMonitor = DeviceMonitor;
})(window);