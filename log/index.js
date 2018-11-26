const bunyan = require('bunyan')

const log = bunyan.createLogger({
    name: 'fcm-proto',
    level: 'debug'
})

module.exports = log
