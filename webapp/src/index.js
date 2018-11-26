import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import  config  from "./firebaseConfig";
import firebase from "firebase"
import fcmApi from './fcmapi'
ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

firebase.initializeApp(config)
initializePush()

function initializePush() {
    const messaging = firebase.messaging();
    messaging
       .requestPermission()
       .then(() => {
          console.log("Have Permission");
          return messaging.getToken();
        })
       .then(token => {
          console.log("FCM Token:", token);
          return fcmApi.register(token)
        })
       .catch(error => {
          if (error.code === "messaging/permission-blocked") {
             console.log("Please Unblock Notification Request Manually");
          } else {
             console.log("Error Occurred", error);
          }
         });
 }