import {Buffer} from 'buffer';
import {
  BaseDataPack, BroadBandFullPulseDataPack, BroadBandSourceDataPack, IntermediateFrequencyDataPack,
  NarrowBandFullPulseDataPack,
  NarrowBandSourceDataPack, PhaseCorrectionDataPack, PositioningDataPack,
  TagDataPack
} from './data-pack';
/**
 * Created by Terry on 2017-5-26.
 */

/**
 * 通信报文
 */
export class ProtocolPack {
  // private head = 0x5555; // 数据头 2
  // private end  = 0xAAAA; // 帧结束符 2
  // private len: number; // 数据长度 2
  private source: number; // 源地址 2
  private dest: number; // 目的地址 2
  private idcodePrimary: number; // 主识别码 2
  private idcodeSecondly: number; // 子识别码 2
  private serial: number; // 序号 4
  private frameCount: number; // 帧包数 4
  public data: Buffer; // 数据 Buffer
  // private checkSum: number; // 和校验 2

  constructor(source: number, dest: number, idcodePrimary: number, idcodeSecondly: number, serial: number, frameCount: number, data) {
    this.source = source;
    this.dest = dest;
    this.idcodePrimary = idcodePrimary;
    this.idcodeSecondly = idcodeSecondly;
    this.serial = serial;
    this.frameCount = frameCount;
    this.data = data;
  }

  // 判断参数里的包和本包是否同一个
  // TODO 还不知道方法是否正确，最好问清楚
  isTheSamePack(pack: ProtocolPack) {
    if (pack.serial - this.serial !== 1) {
      return false;
    }
    if (pack.source !== this.source) {
      return false;
    }
    return (this.idcodePrimary === pack.idcodePrimary && this.idcodeSecondly === pack.idcodeSecondly);
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
        if (len !== 312) {
          console.error(`parser tag data pack error, length is not 312.`);
          return null;
        }
        const pack = new TagDataPack(control, gps);
        pack.datas.push(data.slice(0).toString('hex'));
        // debug it
        if (debug) {
          console.log(`parser tag data pack success.`);
          console.log(pack.description());
          console.log(pack.parserDescription(data.slice(0).toString('hex')));
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
        const pack1 = new NarrowBandFullPulseDataPack(control, gps);
        for (let i = 0; i < count1; i++) {
          pack1.datas.push(data.slice(140 + bytesPerData1 * i, 140 + bytesPerData1 * i + bytesPerData1).toString('hex'));
        }
        if (debug) {
          console.log(`parser narrow band data pack success.`);
          console.log(pack1.description());
          console.log(pack1.parserDescription(pack1.datas[0]));
        }
        return pack1;
      // case 2: // 【全脉冲】数据包
      //   if (len < 140) {
      //     console.error(`parser broad band data pack error, length less than 140.`);
      //     return null;
      //   }
      //   const count2 = data.readUInt32LE(136, false);
      //   const bytesPerData2 = 80;
      //   if (len < 140 + count2 * bytesPerData2) { // 宽带全脉冲描述字（80字节）
      //     console.error(`parser broad band data pack error, length less than ${140 + count2 * bytesPerData2}.`);
      //     return null;
      //   }
      //   const pack2 = new BroadBandFullPulseDataPack(control, gps);
      //   for (let i = 0; i < count2; i++) {
      //     pack2.datas.push(data.slice(140 + bytesPerData2 * i, 140 + bytesPerData2 * i + bytesPerData2).toString('hex'));
      //   }
      //   // debug it
      //   if (debug) {
      //     console.log(`parser broad band data pack success.`);
      //     console.log(pack2.description());
      //     console.log(pack2.parserDescription(pack2.datas[0]));
      //   }
      //   return pack2;
      // case 3: // 【辐射源】数据包
      //   if (len < 140) {
      //     console.error(`parser broad band source data pack error, length less than 140.`);
      //     return null;
      //   }
      //   const count3 = data.readUInt32LE(136, false);
      //   const bytesPerData3 = 276;
      //   if (len < 140 + count3 * bytesPerData3) { // 辐射源描述字数据结构（276）
      //     console.error(`parser broad band source data pack error, length less than ${140 + count3 * bytesPerData3}.`);
      //     return null;
      //   }
      //   const pack3 = new BroadBandSourceDataPack(control, gps);
      //   for (let i = 0; i < count3; i++) {
      //     pack3.datas.push(data.slice(140 + bytesPerData3 * i, 140 + bytesPerData3 * i + bytesPerData3).toString('hex'));
      //   }
      //   // debug it
      //   if (debug) {
      //     console.log(`parser broad band source data pack success.`);
      //     console.log(pack3.description());
      //     console.log(pack3.parserDescription(pack3.datas[0]));
      //   }
      //   return pack3;
      case 4: // 中频数据包
              // if (len !== 524432) {
              //   console.error(`parser intermediate frequency data pack error, length is not 524432.`);
              //   return null;
              // }
        if (len < 140) {
          console.error(`parser intermediate frequency data pack error, length less than 140.`);
          return null;
        }
        if (debug) {
          console.error(`intermediate frequency length: ${len}.`);
        }
        // 中频去掉GPS
        const pack4 = new IntermediateFrequencyDataPack(control, gps);
        pack4.data = data.slice(136, 136 + 10240);
        // debug it
        if (debug) {
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
        // console.log(pack5.description());
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
        // console.log(pack6.description());
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
        // console.log(pack11.description());
        return pack11;
    }
    return null;
  }


}
