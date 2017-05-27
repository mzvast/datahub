import {Injectable} from "@angular/core";
import {Buffer} from "buffer";
import {ProtocolPack} from "app/protocol/protocol-pack";

declare var electron: any; // 　Typescript 定义

@Injectable()
export class UdpService {
  dgram = electron.remote.getGlobal('dgram');
  server = electron.remote.getGlobal('udp').server;
  LocalPORT = 8511;
  RemotePORT = 6011;
  LocalHOST = '127.0.0.1';
  RemoteHOST = '127.0.0.1';

  workingBuffer = Buffer.alloc(0);
  workingProtocolPacks = [];

  constructor() {
    console.log('udp service constructor');
    /**
     * 判断udp server是否已启动，占用了端口
     */
    console.log(this.server);
    if (this.server) {
      this.stopUdpServer();
    }

    this.startUdpServer();
    // this.setRemoteAddress('127.0.0.1', 8511); // Test send to local port
    // this.sendMsg('Hello World');
  }

  startUdpServer() {
    electron.remote.getGlobal('udp').server = this.dgram.createSocket('udp4');
    this.server = electron.remote.getGlobal('udp').server;
    this.server.on('listening', () => {
      const address = this.server.address();
      console.log(`server listening ${address.address}:${address.port}`);
    });

    this.server.on('message', (msg, rinfo) => {
      // const buf = Buffer.from(msg);
      console.log(`server got: ${msg.toString('hex')} from ${rinfo.address}:${rinfo.port}`);
      this.parserProtocolPack(Buffer.from(msg));
      console.log(`server got: ${msg.length} bytes`);
      // this.stopUdpServer();
    });

    this.server.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
      this.server.close();
      console.log('UDP server closed!');
    });

    this.server.bind(this.LocalPORT, this.LocalHOST);
  }

  stopUdpServer() {
    electron.remote.getGlobal('udp').server.close();
    electron.remote.getGlobal('udp').server = null; // 重置null，防止内存泄露
    console.log('UDP server closed!');
  }

  parserProtocolPack(msg: Buffer) {
    this.workingBuffer = Buffer.concat([this.workingBuffer, msg]);
    let headerFounded = false;
    while (this.workingBuffer.length >= 2 && !headerFounded) {
      const header: number = this.workingBuffer.readUInt16BE(0, false);
      if (header === 0x5555) {
        headerFounded = true;
      } else {
        // 如果header不是0x5555,就说明不正常，把这个从数据包里删掉，看接下来的2个字节
        this.workingBuffer = this.workingBuffer.slice(2);
        console.log(`read pack header not 0x5555, drop it: ${header.toString(16)}`);
      }

      if (headerFounded) {
        // 只有超过1024才解析，否则等下一个包来的时候继续
        if (this.workingBuffer.length >= 1024) {
          const len: number = this.workingBuffer.readUInt16BE(2, false);
          const source: number = this.workingBuffer.readUInt16BE(4, false);
          const dest: number = this.workingBuffer.readUInt16BE(6, false);
          const idcodePrimary: number = this.workingBuffer.readUInt16BE(8, false);
          const idcodeSecondly: number = this.workingBuffer.readUInt16BE(10, false);
          const serial: number = this.workingBuffer.readUInt32BE(12, false);
          const frameCount: number = this.workingBuffer.readUInt32BE(16, false);
          const data = this.workingBuffer.slice(20, 20 + len);
          const checkSum = this.workingBuffer.readUInt16BE(1020, false);
          const end = this.workingBuffer.readUInt16BE(1022, false);
          // TODO 要根据checkSum和end来判断这条数据是否正确

          const protocolPack = new ProtocolPack(source, dest, idcodePrimary, idcodeSecondly, serial, frameCount, data);
          if (frameCount === 1) {
            // TODO parser and notify the UI and save to sqlite
          } else {
            if (serial === 0) {
              this.workingProtocolPacks.concat(protocolPack);
            } else {
              for (const workingProtocolPack of this.workingProtocolPacks) {
                if (workingProtocolPack.isTheSamePack(protocolPack)) {
                  workingProtocolPack.appendData(protocolPack.data);
                  if (workingProtocolPack.isComplete()) {
                    // TODO parser and notify the UI and save to sqlite
                    // remove it from workingProtocolPacks
                  }
                }
              }
            }
          }

          // 数据1024都用完了,把headerFounded变成false，再次进入循环解析
          this.workingBuffer = this.workingBuffer.slice(1024);
          headerFounded = false;
        }

      }
    }
  }

  setLocalAddress(host: string, port: number) {
    this.LocalHOST = host;
    this.LocalPORT = port;
    console.log(`setLocalAddress to ${this.LocalHOST}:${this.LocalPORT}`);
  }

  setRemoteAddress(host: string, port: number) {
    this.RemoteHOST = host;
    this.RemotePORT = port;
    console.log(`setRemoteAddress to ${this.RemoteHOST}:${this.RemotePORT}`);
  }

  sendMsg(message: string) {
    const client = this.dgram.createSocket('udp4');
    client.send(message, 0, message.length, this.RemotePORT, this.RemoteHOST, (err) => {
      console.log(`UDP message sent to ${this.RemoteHOST}:${this.RemotePORT} `);
      client.close();
    });
  }
}
