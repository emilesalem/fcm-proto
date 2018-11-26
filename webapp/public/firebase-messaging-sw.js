importScripts("https://www.gstatic.com/firebasejs/4.12.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/4.12.0/firebase-messaging.js");

let config = {
    messagingSenderId: "472265383235"
}

firebase.initializeApp(config);

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(payload => {

   console.log('the payload', payload);
   const title = payload.notification.title;
   const options = {
      body: payload.notification.body,
      icon: payload.notification.icon
   }
   return self.registration.showNotification(title, options);
})