import {Buffer} from 'buffer';
import {
  BaseDataPack, IntermediateFrequencyDataPack, NarrowBandFullPulseDataPack, NarrowBandSourceDataPack, TagDataPack
} from './data-pack';
/**
 * Created by Terry on 2017-5-26.
 */

/**
 * 通信报文
 */
export class ProtocolPack {
  private host: string; // 来自哪个IP
  // private head = 0x5555; // 数据头 2
  // private end  = 0xAAAA; // 帧结束符 2
  // private len: number; // 数据长度 2
  private source: number; // 源地址 2
  private dest: number; // 目的地址 2
  private idcodePrimary: number; // 主识别码 2
  private idcodeSecondly: number; // 子识别码 2
  public serial: number; // 序号 4
  private frameCount: number; // 帧包数 4
  public data: Buffer; // 数据 Buffer
  // private checkSum: number; // 和校验 2

  constructor(host: string, source: number, dest: number, idcodePrimary: number, idcodeSecondly: number,
              serial: number, frameCount: number, data: Buffer) {
    this.host = host;
    this.source = source;
    this.dest = dest;
    this.idcodePrimary = idcodePrimary;
    this.idcodeSecondly = idcodeSecondly;
    this.serial = serial;
    this.frameCount = frameCount;
    this.data = data;
  }

  // 判断参数里的包和本包是否同一个，需要要相差1
  isTheSamePack(pack: ProtocolPack) {
    if (pack.serial - this.serial !== 1) {
      return false;
    }
    // if (pack.source !== this.source) {
    //   return false;
    // }
    // return (this.idcodePrimary === pack.idcodePrimary && this.idcodeSecondly === pack.idcodeSecondly);
    return true;
  }

  // 数据包是否完整了
  isComplete() {
    return this.frameCount - this.serial === 1;
  }

  appendData(data: Buffer) {
    this.data = Buffer.concat([this.data, data]);
    this.serial++;
  }

  parserDataPack(debug: boolean): BaseDataPack {
    const data = this.data;
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
        const pack = new TagDataPack(this.host, control, gps);
        pack.datas.push(data.slice(0));
        // debug it
        if (debug) {
          console.log(pack.description());
          console.log(`parser tag data pack success.`);
        }
        return pack;
      case 1: // 窄带全脉冲数据包
        if (len < 140) {
          console.error(`parser narrow band data pack error, length less than 140.`);
          return null;
        }
        const count1 = data.readUInt32LE(136, false);
        const bytesPerData1 = 64;
        if (len < 140 + count1 * bytesPerData1) { // 窄带全脉冲描述字（64字节）
          console.error(`parser narrow band data pack error, length less than ${140 + count1 * bytesPerData1}.`);
          return null;
        }
        const pack1 = new NarrowBandFullPulseDataPack(this.host, control, gps);
        for (let i = 0; i < count1; i++) {
          pack1.datas.push(data.slice(140 + bytesPerData1 * i, 140 + bytesPerData1 * i + bytesPerData1));
        }
        if (debug) {
          console.log(`parser narrow band data pack success.`);
          console.log(pack1.description());
        }
        return pack1;
      case 4: // 中频数据包
        if (len < 140) {
          console.error(`parser intermediate frequency data pack error, length less than 140.`);
          return null;
        }
        if (debug) {
          console.log(`intermediate frequency length: ${len}.`);
        }
        // 中频去掉GPS
        const pack4 = new IntermediateFrequencyDataPack(this.host, control, gps);
        pack4.datas.push(data.slice(136, 136 + 10240));
        // debug it
        if (debug) {
          console.log(`parser intermediate frequency data pack success.`);
          console.log(pack4.description());
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
        const pack5 = new NarrowBandSourceDataPack(this.host, control, gps);
        for (let i = 0; i < count5; i++) {
          pack5.datas.push(data.slice(140 + bytesPerData5 * i, 140 + bytesPerData5 * i + bytesPerData5));
        }
        if (debug) {
          console.log(`parser narrow band source data pack success.`);
          console.log(pack5.description());
        }
        return pack5;
    }
    return null;
  }


}
