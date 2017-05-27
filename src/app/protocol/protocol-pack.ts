import {Buffer} from "buffer";
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

}
