import { PROTOCOL_PORT, PROTOCOL_MULTICAST_ADDRESS } from './auditor-protocol.js';
import { createSocket } from 'dgram';
import moment from 'moment';
import net from 'net';

const musicians = new Map();

const instrus_sounds = new Map([
  ["piano", "ti-ta-ti"],
  ["trumpet", "pouet"],
  ["flute", "trulu"],
  ["violin", "gzi-gzi"],
  ["drum", "boum-boum"]
]);

class Musician {
  constructor(uuid, sound) {
    if (!uuid || !sound) {
      throw 'Null uuid or song';
    }

    this.uuid = uuid;
    this.instrument = [...instrus_sounds].find(([key, instruSong]) => instruSong === sound)[0];
    this.activeSince = moment();
  }

  toJSON() {
    return {
      uuid: this.uuid,
      instrument: this.instrument,
      activeSince: this.activeSince.format()
    };
  }

  resetTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(this.remove.bind(this), 5000);
  }

  remove() {
    musicians.delete(this.uuid);
  }
}

function getMusiciansBuffer() {
  let musiciansArr = [];
  for (let [k, v] of musicians) {
    musiciansArr.push(v.toJSON());
  }
  return Buffer.from(JSON.stringify(musiciansArr));
}

const s = createSocket('udp4');
s.bind(PROTOCOL_PORT, function () {
  console.log("Joining multicast group");
  s.addMembership(PROTOCOL_MULTICAST_ADDRESS);
});

s.on('message', function(msg, source) {
  console.log("Sound dected!");
  let jsonMsg = JSON.parse(msg.toString());
  if (!musicians.has(jsonMsg.uuid)) {
    musicians.set(jsonMsg.uuid, new Musician(jsonMsg.uuid, jsonMsg.sound));
  }

  musicians.get(jsonMsg.uuid).resetTimeout();
});

var server = net.createServer(function(socket) {
  console.log("New musicians request");
  socket.write(getMusiciansBuffer());
  socket.pipe(socket);
  socket.end();
});

server.listen(PROTOCOL_PORT);