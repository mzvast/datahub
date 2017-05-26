import { Injectable } from '@angular/core';
import {Buffer} from 'buffer';
import { ProtocolPack } from 'app/protocol/protocol-pack';

declare var electron: any; // 　Typescript 定义

@Injectable()
export class UdpService {
  dgram = electron.remote.getGlobal('dgram');
  server = electron.remote.getGlobal('udp').server;
  LocalPORT = 8511;
  RemotePORT = 6011;
  LocalHOST = '127.0.0.1';
  RemoteHOST = '127.0.0.1';

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
      this.parserProtocolPack(msg);
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
    // TODO 先确定msg长度要超过某个值
    const header: number  = msg.readUInt16BE(0, false);
    const len: number = msg.readUInt16BE(2, false);
    console.log(`read pack header: ${header.toString(16)}, length: ${len.toString(16)}`);
    console.log();
    // TODO need parser msg, and notify client
    const protocolPack  = new ProtocolPack();
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
