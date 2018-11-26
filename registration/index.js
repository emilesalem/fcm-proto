const fcm = require('firebase-admin')
const log = require('../log').child({ module: 'registrar' })
const tokens = []

function register (token) {
    // for individual delivery, we store the tokens and use the last one received.
    tokens.unshift(token)
    // we register the token to an FCM topic 'test
    fcm.messaging().subscribeToTopic(token, 'test')
        .then(res => log.info({ res }, 'topic registration'))
        .catch(err => log.error({ err }, 'topic registration'))
}

module.exports = {
    register,
    tokens
}
