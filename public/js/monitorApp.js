class MonitorApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      devices: [],
      updated: 'never'
    }
  }

  getDevices() {
    axios.get('/monitor').then((response) => {
     this.setState({ devices: response.data, "updated": moment().format("h:mmA") })
    }).catch((error) => {
      console.error(error);
    });
  }

  componentDidMount() {
    this.getDevices();
    setInterval(() => this.getDevices(), 500);
  }

  render() {
    return (
      <div className="devices">
        <div style={{display: "flex", alignItems: "center"}}>
          <div style={{textAlign: "left", flexGrow: 1}}>
            <h2>Devices</h2>
          </div>
          <div style={{textAlign: "right", flexGrow: 1}}>
            <h6 className="status">Last updated at {this.state.updated}</h6>
          </div>
        </div>
        
        <div className="row">
          {this.state.devices.map((device, i) => {
            return (
              <div key={i} className="col-xl-4 col-lg-6">
                <Device {...device} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

class Device extends React.Component {
  isOnline(milli) {
    return (milli < 3600000);
  }

  componentDidMount() {
    let target = document.getElementById(`map-${this.props.device_id}`);
    this.map = new google.maps.Map(target, {
      center: { lat: this.props.last_lat, lng: this.props.last_long },
      zoom: 16
    });

    var latLng = new google.maps.LatLng(this.props.last_lat, this.props.last_long);
    var marker = new google.maps.Marker({
      position: latLng,
      icon: '/assets/pin.png',
      scaledSize: new google.maps.Size(10, 10),
      optimized: false,
      map: this.map
    });
  }

  render() {
    let diff = moment().diff(moment(this.props.last_seen))
    let duration = moment.duration(diff);
    let online = this.isOnline(duration.asMilliseconds());

    return (
      <div className="card device">
        <div className="card-header">
          <div className="map" id={`map-${this.props.device_id}`}></div>
        </div>
        <div className="card-block">
          <h4 className="card-title">
            <span className={`status ${online ? 'online':'offline'}`}></span>
            {this.props.device_name}
          </h4>
          <h6 className="last-seen">Last seen {duration.humanize()} ago</h6>
        </div>
      </div>
    )
  }
}

window.MonitorApp = MonitorApp;