const protocol = require('./auditor-protocol');
const dgram = require('dgram');

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
    this.song = [...instrus_sounds].find(([key, instruSong]) => instruSong === song)[0];
  }

  setTime() {
  }
}

const s = dgram.createSocket('udp4');
s.bind(protocol.PROTOCOL_PORT, function () {
  console.log("Joining multicast group");
  s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

s.on('message', function(msg, source) {
  musicians.set(msg.uuid, new Musician(msg.uuid, msg.song));
});
