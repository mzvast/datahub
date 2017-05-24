var PORT = 33333;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var message = Buffer.from('1acf0000', 'hex')
/**
 * Server
 */
var server = dgram.createSocket('udp4');
server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);
    let buf = Buffer.from(message)
    console.log(buf)
    console.log(buf.length)
    console.log(buf[0]==0x1a)
    console.log(buf[1]==0xcf)

});

server.bind(PORT, HOST);
/**
 * Client
 */
var client = dgram.createSocket('udp4');
client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
    if (err) throw err;
    console.log('UDP message sent to ' + HOST +':'+ PORT);
    client.close();
});