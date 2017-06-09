import React from 'react';

class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: `user${Math.floor(Math.random() * 1000000)}`,
      data: []
    }

    this._initializeSocket();
  }

  _initializeSocket() {
    this.ws = new WebSocket('ws://localhost:3000/socket/websocket');

    this.ws.onopen = (arg) => {
      this._joinSocket();
    };

    this.ws.onmessage = (m) => {
      const data = JSON.parse(m.data);

      // set state when new data is received
      this.setState({
        data: [data.payload].concat(this.state.data)
      });
    };

    this.ws.onerror = (e) => {
      console.log("error:", e);
    };

    this.ws.onclose = this.logout;
  }

  _joinSocket() {
    this.ws.send(JSON.stringify({
      "topic": "room:main",
      "event": "phx_join",
      "payload": JSON.stringify({
        "userId": this.state.userId,
        "body": null
      }),
      "ref": "some ref"
    }));
  }

  _handleKeyPress(e) {
    if (e.key == "Enter") {
      // send websocket data
      const payload = JSON.stringify({
        "userId": this.state.userId,
        "body": e.target.value
      });

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
      return this.state.data.map((message) => {
        if (message.userId && message.body) return (
          <p key={Math.random()}>
            <strong>{message.userId}</strong>: {message.body}
          </p>
        )
      })
    }
  }

  render() {
    return (
      <div>
        <h1>Chat Attack!</h1>
        <input
          ref="input"
          onKeyPress={(e) => {this._handleKeyPress(e)}} />

        {this._renderData()}
      </div>
    )
  }
}

export default Main;
