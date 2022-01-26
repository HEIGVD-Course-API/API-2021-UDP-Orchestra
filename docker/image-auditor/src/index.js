import { PROTOCOL_PORT, PROTOCOL_MULTICAST_ADDRESS } from './auditor-protocol.js';
import { createSocket } from 'dgram';
import moment from 'moment';
import express from 'express';

const musicians = new Map();

const instrus_sounds = new Map([
  ["piano", "ti-ta-ti"],
  ["trumpet", "pouet"],
  ["flute", "trulu"],
  ["violin", "gzi-gzi"],
  ["drum", "boum-boum"]
]);

class Musician {
  constructor(uuid, song) {
    if (!uuid || !song) {
      throw 'Null uuid or song';
    }

    this.uuid = uuid;
    this.instrument = [...instrus_sounds].find(([key, instruSong]) => instruSong === song)[0];
    this.activeSince = moment();
    this.lastActive = moment();
  }

  setTime() {
    this.lastActive = moment();
  }
}

function getMusicians() {
  return [...musicians];
}

const s = createSocket('udp4');
s.bind(PROTOCOL_PORT, function () {
  console.log("Joining multicast group");
  s.addMembership(PROTOCOL_MULTICAST_ADDRESS);
});

s.on('message', function(msg, source) {
  if (musicians.has(msg.uuid)) {
    musicians.get(msg.uuid).setTime();
  } else {
    musicians.set(msg.uuid, new Musician(msg.uuid, msg.song));
  }
});

var app = express();
app.get('/', function (req, res) {
  res.send(getMusicians());
});

app.listen(2205, function() {
  console.log('Accepting request on port 2205!');
})