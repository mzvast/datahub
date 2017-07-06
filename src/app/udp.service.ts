import { IntermediateFrequencyControlPack } from './protocol/data-pack';
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
    } else {
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
            const dataPack: BaseDataPack = protocolPack.parserDataPack(this._settingService.debug); // 解析包数据
            if (this._settingService.debug) {
              console.log('dataPack:', dataPack);
            }
            this.sendMessage(dataPack); // 发给UI
          } else { // 帧有多个包
            if (this._settingService.debug) {
              console.log(`serial= ${serial}`);
            }
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
                    const dataPack: BaseDataPack = workingProtocolPack.parserDataPack(this._settingService.debug); // 解析拼接成的包
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

  sendMsg(message: any) {
    const client = this.dgram.createSocket('udp4');
    client.send(message, 0, message.length, this._settingService.remote_port, this._settingService.remote_host, (err) => {
      console.log(`UDP message sent to ${this._settingService.remote_host}:${this._settingService.remote_port} `);
      client.close();
    });
  }

  sendIntFreqRequest(intFreCtlPack: IntermediateFrequencyControlPack) {
    const client = this.dgram.createSocket('udp4');
    const message = intFreCtlPack.packageMessage();
    console.log(`intFreCtlPack: ${message.toString('hex')}`);
    client.send(message, 0, message.length, this._settingService.remote_port, this._settingService.remote_host, (err) => {
      console.log(`UDP message sent to ${this._settingService.remote_host}:${this._settingService.remote_port} `);
      client.close();
    });
  }
}
