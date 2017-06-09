import React from 'react';
import moment from 'moment';
import ColorFlow from 'colorflow';
var colorflow;

class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: `user${Math.floor(Math.random() * 1000000)}`,
      data: []
    }

    this._initializeSocket();
  }

  componentDidUpdate() {
    const obj = document.getElementById('chat-display');
    obj.scrollTop = obj.scrollHeight;
  }

  _initializeSocket() {
    this.ws = new WebSocket('ws://localhost:3000/socket/websocket');

    this.ws.onopen = (arg) => {
      this._joinSocket();
    };

    this.ws.onmessage = (m) => {
      const data = JSON.parse(m.data);

      if (data.payload && data.payload.timestamp) {
        // sort messages by latest timestamp first
        const sortedData = ([data.payload].concat(this.state.data)).sort((a,b) => {
          return a.timestamp - b.timestamp
        });

        // set state when new data is received
        this.setState({
          data: sortedData
        });
      }
      else if (data.payload.color_switch) {
        this._handleColorSwitch(data.payload.color_switch);
      }
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
      "ref": "reference"
    }));
  }

  _clearInputField() {
    this.refs.input.value = "";
  }

  _handleColorSwitch(value) {
    if (value === "ON") {
      this._turnColorOn();
    }
    else {
      this._turnColorOff();
    }
  }

  _turnColorOn() {
    colorflow = new ColorFlow({
        element: ['.colorflow-item'],
        background: ['#85144b', '#F012BE', '#FFBC00', '#7FDBFF', '#01FF70'],
        text: ['#CF5D94', '#EFA9FA', '#665800', '#004966', '#00662C'],
        time: 25
    });
  }

  _turnColorOff() {
    colorflow.disable();
  }

  _handleKeyPress(e) {
    if (e.key == "Enter") {
      const message = e.target.value;

      if (message.trim() === "color") {
        // send websocket data
        this.ws.send(JSON.stringify({
          "topic": "room:main",
          "event": "color_switch",
          "payload": JSON.stringify({"color_switch": "ON"}),
          "ref": "reference"
        }));

        this._clearInputField();
      }
      else if (message.trim()==="stop color" || message.trim()==="color stop") {
        // send websocket data
        this.ws.send(JSON.stringify({
          "topic": "room:main",
          "event": "color_switch",
          "payload": JSON.stringify({"color_switch": "OFF"}),
          "ref": "reference"
        }));

        this._clearInputField();
      }
      else {
        // construct websocket data
        const payload = JSON.stringify({
          "userId": this.state.userId,
          "body": message,
          "timestamp": moment().valueOf()
        });

        // send websocket data
        this.ws.send(JSON.stringify({
          "topic": "room:main",
          "event": "new_message",
          "payload": payload,
          "ref": "reference"
        }));

        this._clearInputField();
      }
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
      <div className="columns">
        <div className="column is-2">
        </div>

        <div className="column">
          <div className="tile is-ancestor">
            <div className="tile is-vertical">
              <div className="tile is-parent">
                <article className="tile is-child box">
                  <p className="title">Chat Attack!</p>
                </article>
              </div>
              <div className="tile is-parent chat-display" id="chat-display">
                <article className="tile is-child box colorflow-item">
                  <div className="content">
                    {this._renderData()}
                  </div>
                </article>
              </div>
              <div className="tile is-parent">
                <article className="tile is-child box">
                  <div className="content">
                    <input
                      ref="input"
                      className="input"
                      autoFocus
                      onKeyPress={(e) => {this._handleKeyPress(e)}} />
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>

        <div className="column is-2">
        </div>
      </div>
    )
  }
}

export default Main;
