import { SettingService } from './setting.service';
import { MySettings } from './settings/my-settings';
import { DatabaseService } from './database.service';
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
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";

declare var electron: any; // 　Typescript 定义

@Injectable()
export class UdpService {
  dgram = electron.remote.getGlobal('dgram');
  server = electron.remote.getGlobal('udp').server;

  workingBuffers: Map<string, Buffer>;
  workingProtocolPacks: Map<string, ProtocolPack>;
  subject = new BehaviorSubject<any>({});

  constructor(private _dbService: DatabaseService, private _settingService: SettingService) {
    console.log('udp service constructor');
    this._dbService.authenticate();
    // this._dbService.create('tag', '123445');
    // this._dbService.index();
    /**
     * 判断udp server是否已启动，占用了端口
     */
    // console.log(this.server);
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
    this.subject.next({});
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  startUdpServer() {
    this.workingBuffers = new Map();
    this.workingProtocolPacks = new Map();
    electron.remote.getGlobal('udp').server = this.dgram.createSocket('udp4');
    this.server = electron.remote.getGlobal('udp').server;
    this.server.on('listening', () => {
      const address = this.server.address();
      console.log(`server listening ${address.address}:${address.port}`);
    });

    this.server.on('message', (msg, rinfo) => {
      // const buf = Buffer.from(msg);
      if (this._settingService.debug) {
        // console.log(msg); // Buffer
        // const str = msg.toString('hex');
        // console.log(`server got ${msg.length} bytes: ${str} from ${rinfo.address}:${rinfo.port}`);
        console.log(`server got ${msg.length} bytes from ${rinfo.address}:${rinfo.port}`);
      }
      if (this._settingService.record) {
        this._dbService.create('pkg', `${msg.toString('hex')}`);
      }
      this.parserProtocolPack(Buffer.from(msg), `${rinfo.address}:${rinfo.port}`);
      // this.stopUdpServer();
    });

    this.server.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
      this.server.close();
      console.log('UDP server closed!');
    });

    this.server.bind(this._settingService.local_port, this._settingService.local_host);
  }

  stopUdpServer() {
    this.workingBuffers = null;
    this.workingProtocolPacks = null;
    if (electron.remote.getGlobal('udp').server != null) {
      electron.remote.getGlobal('udp').server.close();
      electron.remote.getGlobal('udp').server = null; // 重置null，防止内存泄露
      console.log('UDP server closed!');
    }
  }

  parserProtocolPack(msg: Buffer, key: string) {
    let workingBuffer;
    if (this.workingBuffers) { // 确保存在
      workingBuffer = this.workingBuffers.get(key); // 获取全局暂存包
    }else {
      return;
    }
    if (!workingBuffer) {// 全局暂存包不存在，则创建之
      workingBuffer = Buffer.concat([Buffer.alloc(0), msg]);
      this.workingBuffers.set(key, workingBuffer);
    } else {
      workingBuffer = Buffer.concat([workingBuffer, msg]); // 拼接新包
    }
    let headerFounded = false;
    while (workingBuffer.length >= 2 && !headerFounded) {
      const header: number = workingBuffer.readUInt16LE(0, false); // 数据头
      if (header === 0x5555) {
        headerFounded = true;
      } else {
        // 如果header不是0x5555,就说明不正常，把这个从数据包里删掉，看接下来的2个字节
        workingBuffer = workingBuffer.slice(2);
        console.error(`read pack header not 0x5555, drop it: 0x${header.toString(16)}`);
      }

      if (headerFounded) {// 包头部找到
        // 只有超过1024才解析，否则等下一个包来的时候继续
        if (workingBuffer.length >= 1024) {
          const len: number = workingBuffer.readUInt16LE(2, false); // 数据长度
          const source: number = workingBuffer.readUInt16LE(4, false); // 源地址
          const dest: number = workingBuffer.readUInt16LE(6, false); // 目的地址
          const idcodePrimary: number = workingBuffer.readUInt16LE(8, false); // 主识别码
          const idcodeSecondly: number = workingBuffer.readUInt16LE(10, false); // 子识别码
          const serial: number = workingBuffer.readUInt32LE(12, false); // 帧序号
          const frameCount: number = workingBuffer.readUInt32LE(16, false); // 帧包数
          const data = workingBuffer.slice(20, 20 + len); // 数据字段
          const checkSum = workingBuffer.readUInt16LE(1020, false); // 校验
          const end = workingBuffer.readUInt16LE(1022, false); // 帧结束符
          // TODO 要根据checkSum来判断这条数据是否正确
          if (end !== 0xAAAA) {
            console.error(`pack end is not 0xAAAA, it is 0x${end.toString(16)}, drop this pack.`);
            workingBuffer = workingBuffer.slice(1024); // 裁剪掉前1024个字节
            headerFounded = false;
            continue;
          }

          const protocolPack = new ProtocolPack(source, dest, idcodePrimary, idcodeSecondly, serial, frameCount, data);
          // console.log(frameCount);
          if (frameCount === 1) { // 帧只有1个包
            const dataPack: BaseDataPack = this.parserDataPack(protocolPack); // 解析包数据
            if (this._settingService.debug) {
              console.log('dataPack:', dataPack);
            }
            this.sendMessage(dataPack); // 发给UI
          } else { // 帧有多个包
            console.log(`serial= ${serial}`);
            let workingProtocolPack = this.workingProtocolPacks.get(key);
            if (serial === 0) {// 帧首包
              workingProtocolPack = protocolPack;
            } else {
              if (!workingProtocolPack) {// 没收到首包却收到后续包
                console.error(`no last working protocol pack stored, drop this pack.`);
              } else {// 正常后续包
                if (workingProtocolPack.isTheSamePack(protocolPack)) {// 同一帧的连续包
                  workingProtocolPack.appendData(protocolPack.data); // 拼接包
                  if (workingProtocolPack.isComplete()) {// 最后一包
                    this.workingProtocolPacks.delete(key); // 删除全局暂存的包
                    const dataPack: BaseDataPack = this.parserDataPack(workingProtocolPack); // 解析拼接成的包
                    workingProtocolPack = null; // 删除局部变量
                    if (this._settingService.debug) {
                      console.log('dataPackV2:', dataPack);
                    }
                    this.sendMessage(dataPack); // 发给UI
                  }
                } else {// TODO else 漏包\重复问题
                  console.log('丢包');
                  continue;
                }
              }
            }
            if (workingProtocolPack) {// 局部变量存在，后续还有包
              this.workingProtocolPacks.set(key, workingProtocolPack); // 暂存局部变量到全局变量
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
    const header = data.readUInt16LE(0, false);
    if (header !== 0x1ACF) {
      console.error(`parser data pack error, header is not 0x1ACF, it is: 0x${header.toString(16)}`);
      return null;
    }
    const type = data.readUInt16LE(2, false);
    const len = data.readUInt32LE(4, false);
    if (data.length !== len) {
      console.error(`parser data pack error, data length: ${data.length}, expected: ${len}`);
      return null;
    }
    const end = data.readUInt32LE(len - 4, false);
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
      case 0: // 【标签包】
        if (len !== 312) {
          console.error(`parser tag data pack error, length is not 312.`);
          return null;
        }
        const pack = new TagDataPack(control, gps);
        pack.datas.push(data.slice(0).toString('hex'));
        // debug it
        if (this._settingService.debug) {
          console.log(`parser tag data pack success.`);
          console.log(pack.description());
          console.log(pack.parserDescription(data.slice(0).toString('hex')));
        }
        return pack;
      // case 1: // 窄带全脉冲数据包
      //   if (len < 140) {
      //     console.error(`parser narrow band data pack error, length less than 140.`);
      //     return null;
      //   }
      //   const count1 = data.readUInt32LE(136, false);
      //   const bytesPerData1 = 80;
      //   if (len < 140 + count1 * 80) { // 窄带全脉冲描述字（80字节）
      //     console.error(`parser narrow band data pack error, length less than ${140 + count1 * bytesPerData1}.`);
      //     return null;
      //   }
      //   const pack1 = new NarrowBandFullPulseDataPack(control, gps);
      //   for (let i = 0; i < count1; i++) {
      //     pack1.datas.push(data.slice(140 + bytesPerData1 * i, 140 + bytesPerData1 * i + bytesPerData1).toString('hex'));
      //   }
      //   console.log(`parser narrow band data pack success.`);
      //   // debug it
      //   console.log(pack1.description());
      //   return pack1;
      case 1: // 【全脉冲】数据包
        if (len < 140) {
          console.error(`parser broad band data pack error, length less than 140.`);
          return null;
        }
        const count2 = data.readUInt32LE(136, false);
        const bytesPerData2 = 64;
        if (len < 140 + count2 * bytesPerData2) { // 宽带全脉冲描述字（64字节）
          console.error(`parser broad band data pack error, length less than ${140 + count2 * bytesPerData2}.`);
          return null;
        }
        const pack2 = new BroadBandFullPulseDataPack(control, gps);
        for (let i = 0; i < count2; i++) {
          pack2.datas.push(data.slice(140 + bytesPerData2 * i, 140 + bytesPerData2 * i + bytesPerData2).toString('hex'));
        }
        // debug it
        if (this._settingService.debug) {
          console.log(`parser broad band data pack success.`);
          console.log(pack2.description());
          console.log(pack2.parserDescription(pack2.datas[0]));
        }
        return pack2;
      case 5: // 【辐射源】数据包
        if (len < 140) {
          console.error(`parser broad band source data pack error, length less than 140.`);
          return null;
        }
        const count3 = data.readUInt32LE(136, false);
        const bytesPerData3 = 276;
        if (len < 140 + count3 * bytesPerData3) { // 辐射源描述字数据结构（276）
          console.error(`parser broad band source data pack error, length less than ${140 + count3 * bytesPerData3}.`);
          return null;
        }
        const pack3 = new BroadBandSourceDataPack(control, gps);
        for (let i = 0; i < count3; i++) {
          pack3.datas.push(data.slice(140 + bytesPerData3 * i, 140 + bytesPerData3 * i + bytesPerData3).toString('hex'));
        }
        // debug it
        if (this._settingService.debug) {
          console.log(`parser broad band source data pack success.`);
          console.log(pack3.description());
          console.log(pack3.parserDescription(pack3.datas[0]));
        }
        return pack3;
      case 4: // 中频数据包
        // if (len !== 8640) { // TODO 表里说总长是4544不对
        //   console.error(`parser intermediate frequency data pack error, length is not 8640.`);
        //   return null;
        // }
        if (len < 140) {
          console.error(`parser broad band source data pack error, length less than 140.`);
          return null;
        }
        const gps4 = data.slice(76, 76 + 64).toString('hex'); // 中频数据包的gps有点不一样
        const pack4 = new IntermediateFrequencyDataPack(control, gps4);
        pack4.serial = data.readUInt32LE(72, false);
        pack4.data = data.toString('hex', 140, 140 + 524288);
        // debug it
        if (this._settingService.debug) {
          console.log(`parser intermediate frequency data pack success.`);
          console.log(pack4.description());
          console.log(pack4.parserDescription(pack4.data));
        }
        return pack4;
      case 5: // 窄带辐射源数据包
        if (len < 140) {
          console.error(`parser narrow band source data pack error, length less than 140.`);
          return null;
        }
        const count5 = data.readUInt32LE(136, false);
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
        const count11 = data.readUInt32LE(136, false);
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



  sendMsg(message: any) {
    const client = this.dgram.createSocket('udp4');
    client.send(message, 0, message.length, this._settingService.remote_port, this._settingService.remote_host, (err) => {
      console.log(`UDP message sent to ${this._settingService.remote_host}:${this._settingService.remote_port} `);
      client.close();
    });
  }
}
