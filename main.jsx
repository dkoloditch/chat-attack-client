import React from 'react';

class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    }

    this.ws = new WebSocket('ws://localhost:3000/socket/websocket');

    this.ws.onopen = (arg) => {
      this._initializeSocket();
    };

    this.ws.onmessage = (m) => {
      const data = JSON.parse(m.data);

      // set state when new data is received
      this.setState({
        data: [data.payload.body].concat(this.state.data)
      });
    };

    this.ws.onerror = (e) => {
      console.log("error:", e);
    };
    
    this.ws.onclose = this.logout;
  }

  _initializeSocket() {
    this.ws.send(JSON.stringify({
      "topic": "room:main",
      "event": "phx_join",
      "payload": JSON.stringify({"body": null}),
      "ref": "some ref"
    }));
  }

  _handleKeyPress(e) {
    if (e.key == "Enter") {
      // send websocket data
      const payload = JSON.stringify({"body": e.target.value});
      this.ws.send(JSON.stringify({
        "topic": "room:main",
        "event": "new_message",
        "payload": payload,
        "ref": "some ref"
      }));

      // reset input field
      this.refs.input.value = "";
    }
  }

  _renderData() {
    if (this.state.data) {
      return this.state.data.map((d) => {
        return(
          <div key={Math.random()}>
            {d}
          </div>
        )
      })
    }
  }

  render() {
    return (
      <div>
        <label>Chat It Up!</label>
        <br/>
        <br/>
        <input
          ref="input"
          onKeyPress={(e) => {this._handleKeyPress(e)}} />

        {this._renderData()}
      </div>
    )
  }
}

export default Main;
