const protocol = require("./protocol.js");
const dgram = require("dgram");
const RFC4122 = require('rfc4122');

const INTERVAL = 1000;

// Generate a new id
const uuid = new RFC4122().v4f();

// Get map of sounds from protocol
const sounds = new Map(protocol.INSTRUMENTS);

// Retrieve sound based on the user choice
const sound = sounds.get(process.argv[2]);

// Create socket
const socket = dgram.createSocket('udp4');

// Send dgram every INTERVAL seconds
setInterval(() => socket.send(JSON.stringify({uuid:uuid, sound:sound}), protocol.PORT, protocol.HOST), INTERVAL);