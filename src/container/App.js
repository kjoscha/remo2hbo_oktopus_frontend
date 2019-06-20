import React, { Component } from 'react';
import './App.css';
import NumericSignal from '../components/NumericSignal'
import GraphSignal from '../components/GraphSignal';
import Settings from '../utils/Settings';
import SettingsModal from '../utils/SettingsModal';
import contrastIcon from '../images/contrastIcon.png';
const EVENT_STREAM_ADDRESS = "http://localhost:5000/events"; //    http://141.45.146.235:8200



class App extends Component {

    constructor(props) {
      super(props);
      this.evtSource = new EventSource(EVENT_STREAM_ADDRESS);
      this.state = {
        connection: "not connected",
        ekg: {min: 0, max: 0, current: 0},
        pulse: {min: 0, max: 0, current: 0},
        temperature: {min: 0, max: 0, current: 0},
        oxygen: {min: 0, max: 0, current: 0},
        heartrate: {min: 0, max: 0, current: 0},
        systole: {min: 0, max: 0, current: 0},
        diastole: {min: 0, max: 0, current: 0},
        showDarkContrast: false,
      };
    }

    componentDidMount() {
    var that = this;

    this.evtSource.onerror = function (e) {
      console.log("error: ", e);
      that.setState(Object.assign({}, { connection: "error" }));
    };

    this.evtSource.onopen = function (e) {
      console.log("open: ", e);
      while(e.srcElement.readyState == 0) {
        console.log("connecting...");
        that.setState(Object.assign({}, { connection: "connecting..." }));
      }
      that.setState(Object.assign({}, { connection: "connected" }));
    };

    this.evtSource.close = function (e) {
      console.log("close: ",this.evtSource.readyState);
      that.setState(Object.assign({}, { connection: "not connected" }));
    };


    this.subscribeSSE("ekg");
    this.subscribeSSE("pulse");
    this.subscribeSSE("temperature");
    this.subscribeSSE("heartrate");
    this.subscribeSSE("oxygen");
    this.subscribeSSE("diastole");
    this.subscribeSSE("systole");
  }

// This function subscribes a server side event for each vital sign to which it is applied:
  subscribeSSE(vitalSign) {
    var that = this;
    this.evtSource.addEventListener(vitalSign, function (e) {
      that.setState({[vitalSign]: Object.assign({...that.state[vitalSign]}, {current: e.data})});
    }, false);
  }



  componentDidUpdate() {
    if(this.state.readyState == 0){
      this.setState(Object.assign({}, { connection: "connecting..." }));
    }
    if(this.state.readyState == 1){
      this.setState(Object.assign({}, { connection: "connected" }));
    }
    if(this.state.readyState == 2){
      this.setState(Object.assign({}, { connection: "closed" }));
    }
  }

  render() {

    return (
      <div className="app-container">
      <SettingsModal />
        <div id="header">
          OKTOPUS BIOSIGNAL MONITORING jo
        </div>

        <div id="grid-container">

          <div className="biosignal-EKG">
            <GraphSignal bioSignalType="EKG" bioSignalValue={this.state.ekg.current} valueRangeMin={-10} valueRangeMax={600} />
          </div>
          <div className="biosignal-HR-Graph">
            <GraphSignal bioSignalType="Pulse" bioSignalValue={this.state.pulse.current} valueRangeMin={0} valueRangeMax={800}/>
          </div>
          <div className="biosignal-placeholder-Graph">
            <GraphSignal bioSignalType="EKG" bioSignalValue={this.state.ekg.current} valueRangeMin={-10} valueRangeMax={600} />
          </div>

          <div className="biosignal-Temp">
            <NumericSignal bioSignalType="Temp °C" bioSignalValue={this.state.temperature.current} />
          </div>
          <div className="biosignal-HR" >
            <NumericSignal bioSignalType="HR / min" bioSignalValue={this.state.heartrate.current} />
          </div>
          <div className="biosignal-sO2"  >
            <NumericSignal bioSignalType="spO2 %" bioSignalValue={this.state.oxygen.current} />
          </div>
          <div  className="biosignal-RR">
            <NumericSignal bioSignalType="Sys / Dia mmHG" bioSignalValue={this.state.diastole.current} bioSignalValueAddOn={this.state.systole.current} />
          </div>

        </div>

        <div id="footer">connection status: {this.state.connection}.</div>
      </div>
    );
  }
}

export default App;
