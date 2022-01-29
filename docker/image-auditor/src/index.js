import { PROTOCOL_PORT, PROTOCOL_MULTICAST_ADDRESS, INSTRUS_SOUNDS } from './auditor-protocol.js';
import dgram from 'dgram';
import moment from 'moment';
import net from 'net';

const musicians = new Map();

class Musician {
  constructor(uuid, sound) {
    if (!uuid || !sound) {
      throw 'Null uuid or song';
    }

    // Save the uuid, instrument from given sound and current date.
    this.uuid = uuid;
    this.instrument = [...INSTRUS_SOUNDS].find(([key, instruSong]) => instruSong === sound)[0];
    this.activeSince = moment();
  }

  /**
   * @returns Return this in JSON format.
   */
  toJSON() {
    return {
      uuid: this.uuid,
      instrument: this.instrument,
      activeSince: this.activeSince.format()
    };
  }

  /**
   * Set or reset the timeout to self desctruct in 5 seconds.
   */
  resetTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(this.remove.bind(this), 5000);
  }

  /**
   * Self remove from musicians map.
   */
  remove() {
    musicians.delete(this.uuid);
  }
}

/**
 * @returns Get a buffer to send current musicians status.
 */
function getMusiciansBuffer() {
  // Add all musicians to an array before creating the buffer.
  let musiciansArr = [];
  for (let [k, v] of musicians) {
    musiciansArr.push(v.toJSON());
  }
  return Buffer.from(JSON.stringify(musiciansArr));
}

// Begin reading broadcast address.
const s = dgram.createSocket('udp4');
s.bind(PROTOCOL_PORT, function () {
  console.log("Joining multicast group");
  s.addMembership(PROTOCOL_MULTICAST_ADDRESS);
});

// Detect new sounds.
s.on('message', function(msg, source) {
  console.log("Sound dected!");

  let jsonMsg = JSON.parse(msg.toString());

  // If the musicians as never been heard, add it to the map.
  if (!musicians.has(jsonMsg.uuid)) {
    musicians.set(jsonMsg.uuid, new Musician(jsonMsg.uuid, jsonMsg.sound));
  }

  musicians.get(jsonMsg.uuid).resetTimeout();
});

// TCP server to return current active musicians.
var server = net.createServer(function(socket) {
  console.log("New musicians request");
  socket.write(getMusiciansBuffer());
  socket.pipe(socket);
  socket.end();
});

server.listen(PROTOCOL_PORT);