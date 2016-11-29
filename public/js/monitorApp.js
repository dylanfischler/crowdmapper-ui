// var deviceMonitor = new DeviceMonitor();


// deviceMonitor.refresh().then(function() {
  
// }).catch(function(err) {
//   console.error(err);
// })


// window.MonitorApp = React.createClass({
//   initialState: 
//   getDevices: function() {
//     var self = this;

//     axios.get('/monitor').then(function(response) {
//      self.setState({ devices: response })
//     }).catch(function(error) {
//       console.error(error);
//     });
//   },
//   render: function() {
//     return (
//       <div>
//         <h2>Devices</h2>
//       </div>
//     )
//   },
//   componentDidMount: function() {
//     deviceMonitor
//   }
// });

class MonitorApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      devices: []
    }
  }

  getDevices() {
    axios.get('/monitor').then((response) => {
     this.setState({ devices: response.data })
    }).catch((error) => {
      console.error(error);
    });
  }

  componentDidMount() {
    this.getDevices();
  }

  render() {
    return (
      <div className="devices">
        <h2>Devices</h2>
        <div className="row">
          {this.state.devices.map((device, i) => {
            return (
              <div key={i} className="col-md-4">
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
    return (milli < 3600000 * 5);
  }

  render() {
    let diff = moment().diff(moment(this.props.last_seen))
    let duration = moment.duration(diff);
    let online = this.isOnline(duration.asMilliseconds())

    return (
      <div className="card card-block device">
        <h4 className="card-title">
          <span className={`status ${online ? 'online':'offline'}`}></span>
          {this.props.device_name}
        </h4>
        <h6 className="last-seen">Last seen {duration.humanize()} ago</h6>
      </div>
    )
  }
}

window.MonitorApp = MonitorApp;