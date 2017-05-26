/**
 * Created by Terry on 2017-5-26.
 */

/**
 * 通信报文
 */
export class ProtocolPack {
  private header = 0x5555; // 数据头 2
  private end  = 0xAAAA; // 帧结束符 2
  private len: number; // 数据长度 2
  private source: number; // 源地址 2
  private dest: number; // 目的地址 2
  private idcodePrimary; // 主识别码 2
  private idcodeSecondly; // 子识别码 2
  private serial; // 序号 4
  private frameCount; // 帧包数 4
  private data; // 数据
  private checkSum; // 和校验 2
}
