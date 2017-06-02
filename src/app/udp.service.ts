import { Injectable } from '@angular/core';
import { Buffer } from 'buffer';
import { ProtocolPack } from 'app/protocol/protocol-pack';
import {
  BaseDataPack,
  BroadBandFullPulseDataPack,
  BroadBandSourceDataPack,
  IntermediateFrequencyDataPack,
  NarrowBandFullPulseDataPack,
  NarrowBandSourceDataPack, PhaseCorrectionDataPack,
  PositioningDataPack,
  TagDataPack
} from 'app/protocol/data-pack';
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";

declare var electron: any; // 　Typescript 定义

@Injectable()
export class UdpService {
  dgram = electron.remote.getGlobal('dgram');
  server = electron.remote.getGlobal('udp').server;
  LocalPORT = 8511;
  RemotePORT = 6011;
  LocalHOST = '127.0.0.1';
  RemoteHOST = '127.0.0.1';

  workingBuffers: Map<string, Buffer> = new Map();
  workingProtocolPacks: Map<string, ProtocolPack> = new Map();
  subject = new Subject<any>();

  constructor() {
    console.log('udp service constructor');
    /**
     * 判断udp server是否已启动，占用了端口
     */
    console.log(this.server);
    if (this.server) {
      this.stopUdpServer();
    }

    // this.startUdpServer();
    // this.setRemoteAddress('127.0.0.1', 8511); // Test send to local port
    // this.sendMsg('Hello World');
  }

  sendMessage(message: any) {
    this.subject.next(message);
  }

  clearMessage() {
    this.subject.next();
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
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
        console.error(`read pack header not 0x5555, drop it: 0x${header.toString(16)}`);
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
          // TODO 要根据checkSum来判断这条数据是否正确
          if (end !== 0xAAAA) {
            console.error(`pack end is not 0xAAAA, it is 0x${end.toString(16)}, drop this pack.`);
            workingBuffer.slice(1024);
            headerFounded = false;
            continue;
          }

          const protocolPack = new ProtocolPack(source, dest, idcodePrimary, idcodeSecondly, serial, frameCount, data);
          if (frameCount === 1) {
            const dataPack: BaseDataPack = this.parserDataPack(protocolPack);
            //  TODO save to sqlite
            console.log('dataPack:', dataPack);
            this.sendMessage(dataPack); // save msg
          } else {
            let workingProtocolPack = this.workingProtocolPacks.get(key);
            if (serial === 0) {
              workingProtocolPack = protocolPack;
            } else {
              if (!workingProtocolPack) {
                console.error(`no last working protocol pack stored, drop this pack.`);
              } else {
                if (workingProtocolPack.isTheSamePack(protocolPack)) {
                  workingProtocolPack.appendData(protocolPack.data);
                  if (workingProtocolPack.isComplete()) {
                    this.workingProtocolPacks.delete(key);
                    const dataPack: BaseDataPack = this.parserDataPack(workingProtocolPack);
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
        } else {
          console.warn(`read pack not 1024, wait for another pack to append.`);
        }

      }
    }
    this.workingBuffers.set(key, workingBuffer);
  }

  parserDataPack(protocolPack: ProtocolPack): BaseDataPack {
    const data = protocolPack.data;
    if (data.length < 8) {
      console.error(`parser data pack error, data length: ${data.length}`);
      return null;
    }
    const header = data.readUInt16BE(0, false);
    if (header !== 0x1ACF) {
      console.error(`parser data pack error, header is not 0x1ACF, it is: 0x${header.toString(16)}`);
      return null;
    }
    const type = data.readUInt16BE(2, false);
    const len = data.readUInt32BE(4, false);
    if (data.length !== len) {
      console.error(`parser data pack error, data length: ${data.length}, expected: ${len}`);
      return null;
    }
    const end = data.readUInt32BE(len - 4, false);
    if (end !== 0x0000FC1D) {
      console.error(`parser data pack error, end is not 0x0000FC1D, it is: 0x${end.toString(16)}`);
      return null;
    }
    // 接下来64个系统控制信息
    // 接下来64个GPS数据
    // 接下来是数据信息
    const control = data.slice(8, 8 + 64).toString('hex');
    const gps = data.slice(72, 72 + 64).toString('hex');

    switch (type) {
      case 0: // 标签包
        if (len !== 312) {
          console.error(`parser tag data pack error, length is not 312.`);
          return null;
        }
        const pack = new TagDataPack(control, gps);
        pack.sourceNodeNo = data.readUInt8(136, false);
        pack.destNodeNo = data.readUInt8(137, false);
        pack.feedbackCommandNo = data.readUInt16BE(138, false);
        pack.commandReceiveStatus0 = data.readUInt8(140, false);
        pack.commandReceiveStatus1 = data.readUInt8(141, false);
        pack.taskNo = data.readUInt16BE(142, false);
        pack.frontWorkTemp = data.readUInt16BE(144, false);
        pack.extWorkTemp = data.readUInt16BE(146, false);
        pack.extWorkStatus0 = data.readUInt8(148, false);
        pack.extWorkStatus1 = data.readUInt8(149, false);
        // 文档写上面的status用4字节，那就跳过2个字节
        pack.fullPulseCount = data.readUInt32BE(152, false);
        pack.radiationSourceCount = data.readUInt32BE(156, false);
        pack.ifDataLen = data.readUInt32BE(160, false);
        pack.backup = data.slice(164, 164 + 16).toString('hex');
        pack.frontStatusFeedback = data.slice(180, 180 + 128).toString('hex');
        // 剩下包尾 4 就是308开始
        console.log(`parser tag data pack success.`);
        // debug it
        console.log(pack.description());
        return pack;
      case 1: // 窄带全脉冲数据包
        if (len < 140) {
          console.error(`parser narrow band data pack error, length less than 140.`);
          return null;
        }
        const count1 = data.readUInt32BE(136, false);
        const bytesPerData1 = 80;
        if (len < 140 + count1 * 80) { // 窄带全脉冲描述字（80字节）
          console.error(`parser narrow band data pack error, length less than ${140 + count1 * bytesPerData1}.`);
          return null;
        }
        const pack1 = new NarrowBandFullPulseDataPack(control, gps);
        for (let i = 0; i < count1; i++) {
          pack1.datas.push(data.slice(140 + bytesPerData1 * i, 140 + bytesPerData1 * i + bytesPerData1).toString('hex'));
        }
        console.log(`parser narrow band data pack success.`);
        // debug it
        console.log(pack1.description());
        return pack1;
      case 2: // 宽带全脉冲数据包
        if (len < 140) {
          console.error(`parser broad band data pack error, length less than 140.`);
          return null;
        }
        const count2 = data.readUInt32BE(136, false);
        const bytesPerData2 = 64;
        if (len < 140 + count2 * bytesPerData2) { // 宽带全脉冲描述字（64字节）
          console.error(`parser broad band data pack error, length less than ${140 + count2 * bytesPerData2}.`);
          return null;
        }
        const pack2 = new BroadBandFullPulseDataPack(control, gps);
        for (let i = 0; i < count2; i++) {
          pack2.datas.push(data.slice(140 + bytesPerData2 * i, 140 + bytesPerData2 * i + bytesPerData2).toString('hex'));
        }
        console.log(`parser broad band data pack success.`);
        // debug it
        console.log(pack2.description());
        return pack2;
      case 3: // 宽带辐射源数据包
        if (len < 140) {
          console.error(`parser broad band source data pack error, length less than 140.`);
          return null;
        }
        const count3 = data.readUInt32BE(136, false);
        const bytesPerData3 = 276;
        if (len < 140 + count3 * bytesPerData3) { // 辐射源描述字数据结构（276）
          console.error(`parser broad band source data pack error, length less than ${140 + count3 * bytesPerData3}.`);
          return null;
        }
        const pack3 = new BroadBandSourceDataPack(control, gps);
        for (let i = 0; i < count3; i++) {
          pack3.datas.push(data.slice(140 + bytesPerData3 * i, 140 + bytesPerData3 * i + bytesPerData3).toString('hex'));
        }
        console.log(`parser broad band source data pack success.`);
        // debug it
        console.log(pack3.description());
        return pack3;
      case 4: // 中频数据包
        if (len !== 8640) { // TODO 表里说总长是4544不对
          console.error(`parser intermediate frequency data pack error, length is not 8640.`);
          return null;
        }
        const gps4 = data.slice(78, 78 + 62).toString('hex'); // 中频数据包的gps有点不一样
        const pack4 = new IntermediateFrequencyDataPack(control, gps4);
        pack4.pulseArriveTime = data.readUInt32BE(72, false);
        pack4.serial = data.readUInt16BE(76, false);
        pack4.data = data.slice(140, 140 + 8192).toString('hex');
        pack4.backup = data.slice(8332, 8332 + 304).toString('hex');
        console.log(`parser intermediate frequency data pack success.`);
        // debug it
        console.log(pack4.description());
        return pack4;
      case 5: // 窄带辐射源数据包
        if (len < 140) {
          console.error(`parser narrow band source data pack error, length less than 140.`);
          return null;
        }
        const count5 = data.readUInt32BE(136, false);
        const bytesPerData5 = 276;
        if (len < 140 + count5 * bytesPerData5) { // 辐射源描述字数据结构（276）
          console.error(`parser narrow band source data pack error, length less than ${140 + count5 * bytesPerData5}.`);
          return null;
        }
        const pack5 = new NarrowBandSourceDataPack(control, gps);
        for (let i = 0; i < count5; i++) {
          pack5.datas.push(data.slice(140 + bytesPerData5 * i, 140 + bytesPerData5 * i + bytesPerData5).toString('hex'));
        }
        console.log(`parser narrow band source data pack success.`);
        // debug it
        console.log(pack5.description());
        return pack5;
      case 6:
        if (len !== 268) {
          console.error(`positioning data pack error, length is not 268.`);
          return null;
        }
        const pack6 = new PositioningDataPack(control, gps);
        pack6.backup = data.slice(136, 136 + 128).toString('hex');
        console.log(`parser positioning data pack success.`);
        // debug it
        console.log(pack6.description());
        return pack6;
      case 11: // 相位校正数据
      case 13:
        if (len < 140) {
          console.error(`parser phase correction data pack error, length less than 140.`);
          return null;
        }
        const count11 = data.readUInt32BE(136, false);
        const bytesPerData11 = 96;
        if (len < 140 + count11 * bytesPerData11) { // 辐射源描述字数据结构（276）
          console.error(`parser phase correction data pack error, length less than ${140 + count5 * bytesPerData11}.`);
          return null;
        }
        const pack11 = new PhaseCorrectionDataPack(control, gps);
        for (let i = 0; i < count11; i++) {
          pack11.datas.push(data.slice(140 + bytesPerData11 * i, 140 + bytesPerData11 * i + bytesPerData11).toString('hex'));
        }
        console.log(`parser phase correction data pack success.`);
        // debug it
        console.log(pack11.description());
        return pack11;
    }
    return null;
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
