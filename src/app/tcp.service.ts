import {BaseDataPack, IntermediateFrequencyControlPack} from './protocol/data-pack';
import {SettingService} from './setting.service';
import {DatabaseService} from './database.service';
import {Injectable} from '@angular/core';
import {Buffer} from 'buffer';
import {ProtocolPack} from 'app/protocol/protocol-pack';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';

declare var electron: any; // 　Typescript 定义

@Injectable()
export class TcpService {
  net = electron.remote.getGlobal('net');
  dgram = electron.remote.getGlobal('dgram');
  workingBuffers: Map<string, Buffer>;
  workingProtocolPacks: Map<string, ProtocolPack>;
  subject = new BehaviorSubject<any>({});
  protos: Map<number, JSON>;
  protoIds: Map<number, number>;
  saveFlag = true;

  constructor(private _dbService: DatabaseService,
              private _settingService: SettingService,
              private snackBar: MdSnackBar) {
    this._dbService.authenticate();
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

  loadProtocols() {
    this.protos = new Map();
    this.protoIds = new Map();
    this._dbService.models['proto'].findAll({
      where: {
        in_use: 1
      },
    }).then((result) => {
      result.forEach((curVal) => {
        this.protos.set(curVal.type, JSON.parse(curVal.raw.toString()));
        this.protoIds.set(curVal.type, curVal.id);
        if (this._settingService.debug) {
          console.log(`in use proto type: ${curVal.type}, ${curVal.raw.toString()}`);
        }
      });
    }).catch((error) => {
      console.log('can not load protos from db:', error);
    });
  }

  toggleSave(save: boolean) {
    this.saveFlag = save;
  }

  startTcpServer() {
    this.loadProtocols();
    this.workingBuffers = new Map();
    this.workingProtocolPacks = new Map();

    const that = this;

    electron.remote.getGlobal('tcp').server = this.net.createServer(function (sock) {

      console.log(`client connected: ${sock.remoteAddress}:${sock.remotePort}`);
      that._settingService.updateSettingHostIfNotExists(sock.remoteAddress);
      that.showMessage('已连接: ' + sock.remoteAddress);

      sock.on('data', function (data) {
        if (!electron.remote.getGlobal('tcp').server) {
          return;
        }
        console.log(`server got ${data.length} bytes from ${sock.remoteAddress}:${sock.remotePort}`);
        that.parserProtocolPack(Buffer.from(data), sock.remoteAddress, sock.remotePort);
        if (that._settingService.record) {
          that._dbService.createRaw('pkg', sock.remoteAddress, `${data.toString('hex')}`);
        }
      });

      sock.on('close', function (data) {
        that.showMessage('已断开: ' + sock.remoteAddress);
        console.log(`client disconnected: ${sock.remoteAddress}:${sock.remotePort}`);
      });

    }).listen(this._settingService.local_port);

    console.log(`tcp server listening on: ${this._settingService.local_port}`);

  }

  showMessage(message) {
    const config = new MdSnackBarConfig();
    config.duration = 5000;
    this.snackBar.open(message, null, config);
  }

  stopTcpServer() {
    this.workingBuffers = null;
    this.workingProtocolPacks = null;
    if (electron.remote.getGlobal('tcp').server != null) {
      electron.remote.getGlobal('tcp').server.close(function () {
        console.log('tcp server closed.');
      });
      electron.remote.getGlobal('tcp').server = null; // 重置null，防止内存泄露
    }

  }

  /**
   * 解析1024个，msg的长度肯定1024,header也肯定正确了
   */
  parserProtocolBody(msg: Buffer, host: string, port: number) {
    // const header: number = msg.readUInt16LE(0, false); // 数据头
    const len: number = msg.readUInt16LE(2); // 数据长度
    const source: number = msg.readUInt16LE(4); // 源地址
    const dest: number = msg.readUInt16LE(6); // 目的地址
    const idcodePrimary: number = msg.readUInt16LE(8); // 主识别码
    const idcodeSecondly: number = msg.readUInt16LE(10); // 子识别码
    const serial: number = msg.readUInt32LE(12); // 帧序号
    const frameCount: number = msg.readUInt32LE(16); // 帧包数
    // const checkSum = msg.readUInt16LE(1020); // 校验
    const end = msg.readUInt16LE(1022); // 帧结束符
    if (end !== 0xAAAA) {
      console.error(`pack end is 0x${end.toString(16)}, drop this pack.`);
      return;
    }
    const key = host + ':' + port + '_' + idcodePrimary;
    const data = msg.slice(20, 20 + len); // 数据字段
    const protocolPack = new ProtocolPack(host, source, dest, idcodePrimary, idcodeSecondly, serial, frameCount, data);
    // console.log(frameCount);
    if (frameCount === 1) { // 帧只有1个包
      const dataPack: BaseDataPack = protocolPack.parserDataPack(this._settingService.debug); // 解析包数据
      if (this._settingService.debug) {
        console.log('dataPack:', dataPack);
      }
      if (dataPack) {
        const protoId = this.protoIds.get(dataPack.type);
        if (!protoId) {
          console.error(`can not find current protoId, abort`);
        } else {
          const proto = this.protos.get(dataPack.type);
          dataPack.protoId = protoId;
          dataPack.proto = proto;
          // dataPack.saveFlag = this.saveFlag;
          if (dataPack.type === 4 && !this.saveFlag) {
            // 如果是中频且不要保存，就不要发过去了，因为不显示的
          } else {
            this.sendMessage(dataPack); // 发给UI
          }
          this.saveRawDataToDB(dataPack.type, protoId, host, protocolPack.data);
        }

      }
    } else {
      if (this._settingService.debug) {
        console.log(`key= ${key}, serial= ${serial}/${frameCount}`);
      }
      let workingProtocolPack = this.workingProtocolPacks.get(key);
      if (serial === 0) {// 帧首包
        workingProtocolPack = protocolPack;
      } else { // serial > 0
        if (!workingProtocolPack) {// 没收到首包却收到后续包
          console.error(`no last working protocol pack stored, drop this pack.`);
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
                const protoId = this.protoIds.get(dataPack.type);
                if (!protoId) {
                  console.error(`can not find current protoId, abort`);
                } else {
                  const proto = this.protos.get(dataPack.type);
                  dataPack.protoId = protoId;
                  dataPack.proto = proto;
                  // dataPack.saveFlag = this.saveFlag;
                  if (dataPack.type === 4 && !this.saveFlag) {
                    // 如果是中频且不要保存，就不要发过去了，因为不显示的
                  } else {
                    this.sendMessage(dataPack); // 发给UI
                  }
                  this.saveRawDataToDB(dataPack.type, protoId, host, workingProtocolPack.data);
                }
              }
              workingProtocolPack = null; // 删除局部变量
              this.workingProtocolPacks.delete(key);
            }
          } else { //
            console.error(`丢包, this pack serial= ${serial}, last pack serial: ${workingProtocolPack.serial}`);
          }
        }
      } // serial > 0 end
      if (workingProtocolPack) {// 局部变量存在，后续还有包
        this.workingProtocolPacks.set(key, workingProtocolPack); // 暂存局部变量到全局变量
      }
    }
  }

  parserProtocolPack(buffer: Buffer, host: string, port: number) {
    let workingBuffer;
    if (!this.workingBuffers) {
      this.workingBuffers = new Map();
    }
    const fromAddress = host + ':' + port;
    workingBuffer = this.workingBuffers.get(fromAddress); // 获取全局暂存包
    if (!workingBuffer) {// 全局暂存包不存在，则创建之
      workingBuffer = Buffer.concat([Buffer.alloc(0), buffer]);
    } else {
      workingBuffer = Buffer.concat([workingBuffer, buffer]); // 拼接新包
      if (this._settingService.debug) {
        console.log(`working buffer length after concat: ${workingBuffer.length}`);
      }
    }
    let headerFounded = false;
    while (workingBuffer.length >= 10 && !headerFounded) {
      const header: number = workingBuffer.readUInt16LE(0, false); // 数据头
      if (header === 0x5555) {
        headerFounded = true;
      } else {
        // 如果header不是0x5555,就说明不正常，把这个从数据包里删掉，看接下来的2个字节
        workingBuffer = workingBuffer.slice(2);
        console.error(`read pack header not 0x5555, drop it: 0x${header.toString(16)}`);
      }
      if (headerFounded) {
        if (workingBuffer.length >= 1024) {
          this.parserProtocolBody(workingBuffer.slice(0, 1024), host, port);

          // 数据1024都用完了,把headerFounded变成false，再次进入循环解析
          workingBuffer = workingBuffer.slice(1024);
          headerFounded = false;
        } else {
          console.warn(`read pack not 1024, wait for another pack to append.`);
        }
      } // end header found
    } // end while
    if (workingBuffer.length > 0) {
      this.workingBuffers.set(fromAddress, workingBuffer);
      console.warn(`remaining buffer length: ${workingBuffer.length}, save to working buffer: ${fromAddress}`);
    } else {
      this.workingBuffers.delete(fromAddress);
    }
  }

  /**
   * 存的是protocol-pack里的data字段
   */
  saveRawDataToDB(type: number, protoId: number, host: string, data: Buffer) {
    console.log(`save raw to db, type: ${type}, protoId: ${protoId}, host: ${host}, save: ${this.saveFlag}`);
    if (!this.saveFlag) {
      return;
    }
    switch (type) {
      case 0: // 标签包
        this._dbService.create('tag', protoId, host, data.toString('hex'));
        break;
      case 1: // 窄带全脉冲数据包
        this._dbService.create('pdw', protoId, host, data.toString('hex'));
        break;
      case 5: // 窄带辐射源数据包
        this._dbService.create('radiation', protoId, host, data.toString('hex'));
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
