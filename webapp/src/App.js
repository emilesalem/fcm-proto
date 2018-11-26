import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            FCM Spike COMM-2018.24
          </p>
          <a
            className="App-link"
            href="https://workjam.atlassian.net/wiki/spaces/~725087507/blog/2018/11/22/466616367/Firebase+Cloud+Messaging+service"
            target="_blank"
            rel="noopener noreferrer"
          >
            FCM notes
          </a>
        </header>
      </div>
    );
  }
}

export default App;
