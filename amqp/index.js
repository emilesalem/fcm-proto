module.exports = {
    channelStream,
    assert,
    messageStream
}

const amqp = require('amqplib')
const { throwError, timer, fromEvent, merge, defer } = require('rxjs')
const { tap, retryWhen, switchMap, delayWhen, scan } = require('rxjs/operators')
const log = require('../log')
const EventEmitter = require('events')

const fcmExchange = 'FCM.exchange'
const fcmQueue = 'FCM.queue'

// channelStream returns an observable stream of amqp channels
function channelStream () {
    return defer(() => amqp.connect('amqp://localhost')).pipe(
        tap(() => log.info('amqp connection established')),
        switchMap(conn => merge(conn.createChannel(), onConnectionClosed(conn))),
        retryWhen(retrySignal)
    )
}

function assert (ch) {
    return ch.assertExchange(fcmExchange, 'direct')
        .then(() => ch.assertQueue(fcmQueue))
        .then(() => ch.bindQueue(fcmQueue, fcmExchange, 'fcm'))
        .then(() => ch)
}

// messageStream receives an AMQP channel and returns an observable stream of amqp messages
function messageStream (ch) {
    const msgEmitter = new EventEmitter()
    const result = fromEvent(msgEmitter, 'msg')
    ch.consume(fcmQueue, msg => msgEmitter.emit('msg', msg))
    return result
}

// retrySignal takes an observable stream of errors and emits the retry signal with an arithmetically progressive delay;
// after 10 retry attempts the delay is reset to 2 seconds
function retrySignal (errors) {
    return errors.pipe(
        scan(acc => ++acc, 0),
        tap(times => log.info(`connection attempt #${times} failed`)),
        scan(acc => (++acc < 10 ? acc : 1), 0),
        tap(times => log.info(`attempting reconnect in ${times * 2}s...`)),
        delayWhen(times => timer(times * 2 * 1000))
    )
}

function onConnectionClosed (conn) {
    return fromEvent(conn, 'close').pipe(
        tap(err => log.error({ connect_error: err }, 'amqp connection closed')),
        switchMap(throwError)
    )
}
