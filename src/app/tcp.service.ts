import {BaseDataPack, IntermediateFrequencyControlPack} from './protocol/data-pack';
import {SettingService} from './setting.service';
import {DatabaseService} from './database.service';
import {Injectable} from '@angular/core';
import {Buffer} from 'buffer';
import {ProtocolPack} from 'app/protocol/protocol-pack';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';

declare var electron: any; // 　Typescript 定义

@Injectable()
export class TcpService {
  net = electron.remote.getGlobal('net');
  dgram = electron.remote.getGlobal('dgram');
  workingProtocolPacks: Map<string, ProtocolPack>;
  subject = new BehaviorSubject<any>({});

  constructor(private _dbService: DatabaseService, private _settingService: SettingService) {
    console.log('tcp service constructor');
    this._dbService.authenticate();
    // this._dbService.create('tag', '123445');
    // this._dbService.index();
    /**
     * 判断udp server是否已启动，占用了端口
     */
    // console.log(this.server);
    if (electron.remote.getGlobal('net').server) {
      this.stopTcpServer();
    }

    // this.startTcpServer();
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

  startTcpServer() {
    this.workingProtocolPacks = new Map();

    const that = this;

    electron.remote.getGlobal('tcp').server = this.net.createServer(function (sock) {

      console.log(`client connected: ${sock.remoteAddress}:${sock.remotePort}`);


      sock.on('data', function (data) {
        if (!electron.remote.getGlobal('tcp').server) {
          return;
        }
        console.log(`server got ${data.length} bytes from ${sock.remoteAddress}:${sock.remotePort}`);
        that.parserProtocolPack(Buffer.from(data), `${sock.remoteAddress}:${sock.remotePort}`);
        if (that._settingService.record) {
          that._dbService.create('pkg', `${data.toString('hex')}`);
        }
      });

      sock.on('close', function (data) {
        console.log(`client disconnected: ${sock.remoteAddress}:${sock.remotePort}`);
      });

    }).listen(this._settingService.local_port);

    console.log(`tcp server listening on: ${this._settingService.local_port}`);

  }

  stopTcpServer() {
    this.workingProtocolPacks = null;
    if (electron.remote.getGlobal('tcp').server != null) {
      electron.remote.getGlobal('tcp').server.close(function () {
        console.log('tcp server closed.');
      });
      electron.remote.getGlobal('tcp').server = null; // 重置null，防止内存泄露
    }

  }

  parserProtocolPack(msg: Buffer, fromAddress: string) {
    if (msg.length !== 1024) {
      console.error(`pack from ${fromAddress} not 1024, it is ${msg.length}, abort parser.`);
      return;
    }
    const header = msg.readUInt16LE(0); // 数据头
    const len: number = msg.readUInt16LE(2); // 数据长度
    const source: number = msg.readUInt16LE(4); // 源地址
    const dest: number = msg.readUInt16LE(6); // 目的地址
    const idcodePrimary: number = msg.readUInt16LE(8); // 主识别码
    const idcodeSecondly: number = msg.readUInt16LE(10); // 子识别码
    const serial: number = msg.readUInt32LE(12); // 帧序号
    const frameCount: number = msg.readUInt32LE(16); // 帧包数
    // const checkSum = msg.readUInt16LE(1020); // 校验
    const end = msg.readUInt16LE(1022); // 帧结束符
    if (header !== 0x5555 || end !== 0xAAAA) {
      console.error(`pack header is ${header.toString(16)}, end is 0x${end.toString(16)}, drop this pack.`);
      return;
    }

    const data = msg.slice(20, 20 + len); // 数据字段
    const protocolPack = new ProtocolPack(source, dest, idcodePrimary, idcodeSecondly, serial, frameCount, data);
    // console.log(frameCount);
    if (frameCount === 1) { // 帧只有1个包
      const dataPack: BaseDataPack = protocolPack.parserDataPack(this._settingService.debug); // 解析包数据
      if (this._settingService.debug) {
        console.log('dataPack:', dataPack);
      }
      if (dataPack) {
        this.sendMessage(dataPack); // 发给UI
        this.saveRawDataToDB(dataPack.type, protocolPack.data);
      }
    } else {
      // 8511 回复：主识别码分别打上之前的数据类型就行了吧
      const key = fromAddress + '_' + idcodePrimary;
      if (this._settingService.debug) {
        console.log(`key= ${key}, serial= ${serial}`);
      }
      let workingProtocolPack = this.workingProtocolPacks.get(key);
      if (serial === 0) {// 帧首包
        workingProtocolPack = protocolPack;
      } else { // serial > 0
        if (!workingProtocolPack) {// 没收到首包却收到后续包
          console.error(`no last working protocol pack stored, drop this pack.`);
          return;
        } else {// 正常后续包
          if (workingProtocolPack.isTheSamePack(protocolPack)) {// 同一帧的连续包
            workingProtocolPack.appendData(protocolPack.data); // 拼接包
            if (workingProtocolPack.isComplete()) {// 最后一包
              this.workingProtocolPacks.delete(key); // 删除全局暂存的包
              const dataPack: BaseDataPack = workingProtocolPack.parserDataPack(this._settingService.debug); // 解析拼接成的包
              if (this._settingService.debug) {
                console.log('dataPackV2:', dataPack);
              }
              if (dataPack) {
                // if (this._settingService.debug) {
                //   console.log(`dataPackV2 send dataPack message, type: ${dataPack.type}`);
                // }
                this.sendMessage(dataPack); // 发给UI
                this.saveRawDataToDB(dataPack.type, workingProtocolPack.data);
              }
              workingProtocolPack = null; // 删除局部变量
            }
          } else { //
            console.log(`丢包, this pack serial= ${serial}, last pack serial: ${workingProtocolPack.serial}`);
            return;
          }
        }
      } // serial > 0 end
      if (workingProtocolPack) {// 局部变量存在，后续还有包
        this.workingProtocolPacks.set(key, workingProtocolPack); // 暂存局部变量到全局变量
      }
    }
  }

  /**
   * 存的是protocol-pack里的data字段
   * @param dataPack
   */
  saveRawDataToDB(type: number, data: Buffer) {
    console.log(`save raw to db: ${type}`);
    switch (type) {
      case 0: // 标签包
        this._dbService.create('tag', data.toString('hex'));
        break;
      case 1: // 窄带全脉冲数据包
        this._dbService.create('pdw', data.toString('hex'));
        break;
      case 5: // 窄带辐射源数据包
        this._dbService.create('radiation', data.toString('hex'));
        break;
    }
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