import {Injectable} from '@angular/core';
import {Buffer} from 'buffer';
import {ProtocolPack} from 'app/protocol/protocol-pack';
import {BaseDataPack, TagDataPack, PdwDataPack, RadiationDataPack} from 'app/protocol/data-pack';

declare var electron: any; // 　Typescript 定义

@Injectable()
export class UdpService {
  dgram = electron.remote.getGlobal('dgram');
  server = electron.remote.getGlobal('udp').server;
  LocalPORT = 8511;
  RemotePORT = 6011;
  LocalHOST = '127.0.0.1';
  RemoteHOST = '127.0.0.1';

  workingBuffers: Map<string, Buffer>;
  workingProtocolPacks: Map<string, ProtocolPack>;

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
      this.parserProtocolPack(Buffer.from(msg), `${rinfo.address}:${rinfo.port}`);
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

  parserProtocolPack(msg: Buffer, key: string) {
    let workingBuffer = this.workingBuffers.get(key);
    if (!workingBuffer) {
      workingBuffer = Buffer.concat([Buffer.alloc(0), msg]);
      this.workingBuffers.set(key, workingBuffer);
    } else {
      workingBuffer = Buffer.concat([workingBuffer, msg]);
    }
    let headerFounded = false;
    while (workingBuffer.length >= 2 && !headerFounded) {
      const header: number = workingBuffer.readUInt16BE(0, false);
      if (header === 0x5555) {
        headerFounded = true;
      } else {
        // 如果header不是0x5555,就说明不正常，把这个从数据包里删掉，看接下来的2个字节
        workingBuffer = workingBuffer.slice(2);
        console.error(`read pack header not 0x5555, drop it: ${header.toString(16)}`);
      }

      if (headerFounded) {
        // 只有超过1024才解析，否则等下一个包来的时候继续
        if (workingBuffer.length >= 1024) {
          const len: number = workingBuffer.readUInt16BE(2, false);
          const source: number = workingBuffer.readUInt16BE(4, false);
          const dest: number = workingBuffer.readUInt16BE(6, false);
          const idcodePrimary: number = workingBuffer.readUInt16BE(8, false);
          const idcodeSecondly: number = workingBuffer.readUInt16BE(10, false);
          const serial: number = workingBuffer.readUInt32BE(12, false);
          const frameCount: number = workingBuffer.readUInt32BE(16, false);
          const data = workingBuffer.slice(20, 20 + len);
          const checkSum = workingBuffer.readUInt16BE(1020, false);
          const end = workingBuffer.readUInt16BE(1022, false);
          // TODO 要根据checkSum和end来判断这条数据是否正确

          const protocolPack = new ProtocolPack(source, dest, idcodePrimary, idcodeSecondly, serial, frameCount, data);
          if (frameCount === 1) {
            const dataPack = this.parserDataPack(protocolPack);
            // TODO parser and notify the UI and save to sqlite
          } else {
            let workingProtocolPack = this.workingProtocolPacks.get(key);
            if (serial === 0) {
              workingProtocolPack = protocolPack;
            } else {
              if (!workingProtocolPack) {
                console.error(`no last working protocol pack stored, drop this pack`);
              } else {
                if (workingProtocolPack.isTheSamePack(protocolPack)) {
                  workingProtocolPack.appendData(protocolPack.data);
                  if (workingProtocolPack.isComplete()) {
                    this.workingProtocolPacks.delete(key);
                    const dataPack = this.parserDataPack(workingProtocolPack);
                    workingProtocolPack = null;
                    // TODO parser and notify the UI and save to sqlite
                  }
                }
              }
            }
            if (workingProtocolPack) {
              this.workingProtocolPacks.set(key, workingProtocolPack);
            }
          }

          // 数据1024都用完了,把headerFounded变成false，再次进入循环解析
          workingBuffer = workingBuffer.slice(1024);
          headerFounded = false;
        }

      }
    }
    this.workingBuffers.set(key, workingBuffer);
  }

  parserDataPack(protocolPack: ProtocolPack) {
    const data = protocolPack.data;
    const header = data.readUInt16BE(0, false);
    const type = data.readUInt16BE(2, false);
    const len = data.readUInt32BE(4, false);
    // 接下来64个系统控制信息
    // 接下来64个GPS数据
    // 接下来是数据信息
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
