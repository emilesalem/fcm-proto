module.exports = {
  start
};

const log = require("../log").child({ module: "msg_producer" });
const { of } = require("rxjs");
const { mergeMap, repeat, delay, tap } = require("rxjs/operators");

function start(ch) {
  log.debug("publishing messages");
  of(1).pipe(
    mergeMap(() => {
        log.debug('HERE')
      return of(1).pipe(
        delay(randomDelay()),
        tap(() => {
          log.debug("publishing message");
          return ch.publish(
            "FCM.exchange",
            "fcm",
            Buffer.from(JSON.stringify(randomType()))
          );
        })
      );
    }),
    repeat()
  ).subscribe();
}

function randomType() {
  return {
    type: `TYPE${Math.ceil(Math.random() * 3)}`
  };
}

function randomDelay() {
  const d = Math.floor(Math.random() * 10000);
  log.debug(`delay: ${d}`);
  return d;
}
