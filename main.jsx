import React from 'react';
import moment from 'moment';

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
      // construct websocket data
      const payload = JSON.stringify({
        "userId": this.state.userId,
        "body": e.target.value,
        "timestamp": moment().valueOf()
      });

      // send websocket data
      this.ws.send(JSON.stringify({
        "topic": "room:main",
        "event": "new_message",
        "payload": payload,
        "ref": "reference"
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
      <div className="columns">
        <div className="column">
          <div className="tile is-ancestor">
            <div className="tile is-vertical is-8">
              <div className="tile is-parent">
                <article className="tile is-child box">
                  <p className="title">Chat Attack!</p>
                </article>
              </div>
              <div className="tile is-parent chat-display" id="chat-display">
                <article className="tile is-child box">
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
      </div>
    )
  }
}

export default Main;
