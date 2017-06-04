import {Buffer} from "buffer";
/**
 * Created by Terry on 2017-5-26.
 */

/**
 * 数据基类
 */
export class BaseDataPack {
  // private head = 0x1ACF; // 帧有效标记2
  type: number; // 数据类型 2
  // private len: number; // 数据长度 4
  control: string; // 系统控制信息64，没说具体是什么，方便存储，用string，转成string hex
  gps: string; // GPS数据4，没说具体是什么，方便存储，用string，转成string hex

  // 接下来数据信息
  // 固定信息
  // private end: number; // 包尾4, 0x0000FC1D

  constructor(control: string, gps: string) {
    this.control = control;
    this.gps = gps;
  }
}

/**
 * 数据信息是: 第一个是个数，后面是多少个数据
 */
export class BaseDescriptionDataPack extends BaseDataPack {

  // dataCount: number; // 全脉冲个数统计4
  // 先存成string，取出用的时候再解析里面具体的东西吧
  datas: Array<string> = new Array();

  constructor(control: string, gps: string) {
    super(control, gps);
  }

}

/**
 * 标签包0 312字节
 */
export class TagDataPack extends BaseDataPack {
  sourceNodeNo: number; // 发方节点号1
  destNodeNo: number; // 收方节点号1
  feedbackCommandNo: number; // 反馈指令序号2
  commandReceiveStatus0: number; // 指令接收状态1 0 指令接收正常；1指令接收出现丢帧；
  commandReceiveStatus1: number; // 指令接收状态1 0 指令解析正常；1 指令解析异常
  taskNo: number; // 任务编号2
  frontWorkTemp: number; // 前端工作温度2
  extWorkTemp: number; // 分机工作温度2
  extWorkStatus0: number; // 分机工作状态1 信道化组件状态 0：正常，1：不正常 TODO 我觉得应该是2字节 文档写4字节
  extWorkStatus1: number; // 分机工作状态1 信号分选组件状态 0：正常，1：不正常
  fullPulseCount: number; // 全脉冲个数统计4
  radiationSourceCount: number; // 辐射源数据包统计4
  ifDataLen: number; // 中频数据统计4
  backup: string; // 备份16
  frontStatusFeedback: string; // 前端状态反馈128,没说具体是什么，方便存储，用string

  constructor(control: string, gps: string) {
    super(control, gps);
    this.type = 0;
  }

  description() {
    return `[tag data pack] control: ${this.control}, gps: ${this.gps}, sourceNodeNo: ${this.sourceNodeNo}, ` +
      `destNodeNo: ${this.destNodeNo}, feedbackCommandNo: ${this.feedbackCommandNo}, ` +
      `commandReceiveStatus0: ${this.commandReceiveStatus0}, ` +
      `commandReceiveStatus1: ${this.commandReceiveStatus1}, fullPulseCount: ${this.fullPulseCount}, ` +
      `taskNo: ${this.taskNo}, frontWorkTemp: ${this.frontWorkTemp}, extWorkTemp: ${this.extWorkTemp}, ` +
      `extWorkStatus0: ${this.extWorkStatus0}, extWorkStatus1: ${this.extWorkStatus1}, ` +
      `fullPulseCount: ${this.fullPulseCount}, radiationSourceCount: ${this.radiationSourceCount}, ` +
      `ifDataLen: ${this.ifDataLen}, backup: ${this.backup}, frontStatusFeedback: ${this.frontStatusFeedback}`;
  }
}

/**
 * 窄带全脉冲数据包1
 */
export class NarrowBandFullPulseDataPack extends BaseDescriptionDataPack {

  constructor(control: string, gps: string) {
    super(control, gps);
    this.type = 1;
  }

  description() {
    return `[narrow band data pack] control: ${this.control}, gps: ${this.gps}, ` +
      `fullPulseDescriptions length: ${this.datas.length}`;
  }

  /**
   * 把data传进入，解析成 窄带全脉冲描述字
   * @param data
   * @returns {NarrowBandFullPulseDescription}
   */
  parserDescription(data: string): NarrowBandFullPulseDescription {
    const desc = new NarrowBandFullPulseDescription();
    const dataHex = Buffer.from(data, 'hex');
    desc.pdwToaTod = dataHex.readUInt32BE(0, false);
    desc.pdwPw = dataHex.readUInt32BE(4, false);
    desc.pdwWorkBand = dataHex.readUInt16BE(8, false);
    return desc;
  }
}

/**
 * 宽带全脉冲数据包2
 */
export class BroadBandFullPulseDataPack extends BaseDescriptionDataPack {

  constructor(control: string, gps: string) {
    super(control, gps);
    this.type = 2;
  }

  description() {
    return `[broad band data pack] control: ${this.control}, gps: ${this.gps}, ` +
      `fullPulseDescriptions length: ${this.datas.length}`;
  }

  /**
   * 把data传进入，解析成 宽带全脉冲描述字
   * @param data
   * @returns {BroadBandFullPulseDescription}
   */
  parserDescription(data: string): BroadBandFullPulseDescription {
    const desc = new BroadBandFullPulseDescription();
    const dataHex = Buffer.from(data, 'hex');
    desc.pdwToaTod = dataHex.readUInt32BE(0, false);
    desc.pdwPw = dataHex.readUInt32BE(4, false);
    desc.pdwVpcnt = dataHex.readUInt16BE(8, false);
    desc.pdwWorkBand = dataHex.readUInt16BE(10, false);
    desc.trackerFreRise = dataHex.readUInt16BE(12, false);
    desc.trackerFreMinOv = dataHex.readUInt16BE(14, false);
    desc.trackerFreMaxOv = dataHex.readUInt16BE(16, false);
    desc.trackerFre3 = dataHex.readUInt16BE(18, false);
    desc.trackerFre4 = dataHex.readUInt16BE(20, false);
    desc.pdwType = dataHex.readUInt8(22, false);
    desc.trackerOrien = dataHex.readUInt8(23, false);
    desc.phase1 = dataHex.readUInt16BE(24, false);
    desc.phase2 = dataHex.readUInt16BE(26, false);
    desc.phase3 = dataHex.readUInt16BE(28, false);
    desc.phase4 = dataHex.readUInt16BE(30, false);
    desc.phase5 = dataHex.readUInt16BE(32, false);
    desc.phase6 = dataHex.readUInt16BE(34, false);
    desc.phase7 = dataHex.readUInt16BE(36, false);
    desc.phase8 = dataHex.readUInt16BE(38, false);
    desc.phase9 = dataHex.readUInt16BE(40, false);
    desc.phase10 = dataHex.readUInt16BE(42, false);
    desc.phase11 = dataHex.readUInt16BE(44, false);
    desc.phase12 = dataHex.readUInt16BE(46, false);
    desc.phase13 = dataHex.readUInt16BE(48, false);
    desc.phase14 = dataHex.readUInt16BE(50, false);
    desc.phase15 = dataHex.readUInt16BE(52, false);
    desc.phase16 = dataHex.readUInt16BE(54, false);
    desc.amplitude1 = dataHex.readUInt8(56, false);
    desc.amplitude2 = dataHex.readUInt8(57, false);
    desc.amplitude3 = dataHex.readUInt8(58, false);
    desc.amplitude4 = dataHex.readUInt8(59, false);
    desc.amplitude5 = dataHex.readUInt8(60, false);
    desc.amplitude6 = dataHex.readUInt8(61, false);
    desc.amplitude7 = dataHex.readUInt8(62, false);
    desc.amplitude8 = dataHex.readUInt8(63, false);
    return desc;
  }
}

/**
 * 宽带辐射源数据包3
 */
export class BroadBandSourceDataPack extends BaseDescriptionDataPack {
  constructor(control: string, gps: string) {
    super(control, gps);
    this.type = 3;
  }

  description() {
    return `[broad band source data pack] control: ${this.control}, gps: ${this.gps}, ` +
      `fullPulseDescriptions length: ${this.datas.length}`;
  }
}

/**
 * 窄带辐射源数据包5
 */
export class NarrowBandSourceDataPack extends BaseDescriptionDataPack {
  constructor(control: string, gps: string) {
    super(control, gps);
    this.type = 5;
  }

  description() {
    return `[narrow band source data pack] control: ${this.control}, gps: ${this.gps}, ` +
      `fullPulseDescriptions length: ${this.datas.length}`;
  }
}

/**
 * 相位校正数据包11 or 13?
 */
export class PhaseCorrectionDataPack extends BaseDescriptionDataPack {
  constructor(control: string, gps: string) {
    super(control, gps);
    this.type = 11; // TODO 11 or 13
  }

  description() {
    return `[narrow band source data pack] control: ${this.control}, gps: ${this.gps}, ` +
      `fullPulseDescriptions length: ${this.datas.length}`;
  }
}

/**
 * 中频数据包4
 */
export class IntermediateFrequencyDataPack extends BaseDataPack {
  data: string; // 中频数据描述字 8192
  pulseArriveTime: number; // 脉冲到达时间4
  serial: number; // 中频包序号2
  backup: string; // 备份304

  constructor(control: string, gps: string) {
    super(control, gps);
    this.type = 4;
  }

  description() {
    return `[intermediate frequency data pack] control: ${this.control}, gps: ${this.gps}, ` +
      `pulseArriveTime: ${this.pulseArriveTime}, serial: ${this.serial}, ` +
      `data: ${this.data}, backup: ${this.backup}`;
  }

}

/**
 * 定位数据6
 */
export class PositioningDataPack extends BaseDataPack {
  backup: string; // 备份128

  constructor(control: string, gps: string) {
    super(control, gps);
    this.type = 6;
  }

  description() {
    return `[positioning data pack] control: ${this.control}, gps: ${this.gps}, ` +
      `backup: ${this.backup}`;
  }
}

/**
 * 宽带全脉冲描述字
 */
export class BroadBandFullPulseDescription {
  pdwToaTod: number; // 1-4bytes 到达时间(单位 4.46ns)
  pdwPw: number; // 5-8bytes 脉宽(单位 4.46ns)
  pdwVpcnt: number; // 9-10bytes 脉冲计数
  pdwWorkBand: number; // 11-12bytes 波段码(单位 MHz)
  trackerFreRise: number; // 13-14bytes 前沿频率(单位 0.01MHz)
  trackerFreMinOv: number; // 15-16bytes 最小频率，当分集信号时，为频率1(单位 0.01MHz)
  trackerFreMaxOv: number; // 17-18bytes 最大频率，当分集信号时，为频率2(单位 0.01MHz)
  trackerFre3: number; // 19-20bytes 当分集信号时，为频率3(单位 0.01MHz)
  trackerFre4: number; // 21-22bytes 当分集信号时，为频率4(单位 0.01MHz)
  pdwType: number; // 23 脉冲类型;  Bit0-1： Bit2-3：0-脉冲Pdw，1-连续波Pdw,3-分集信号 Bit4-7：分集个数
  trackerOrien: number; // 24 线调标记； 0表示递增， 1表示递减， 2表示混合， 3 表示不是线调
  phase1: number; // 25-26 相位1 （单位 0.007度，范围-180~180度）
  phase2: number; // 27-28 相位2 （单位 0.007度，范围-180~180度）
  phase3: number; // 29-30 相位3 （单位 0.007度，范围-180~180度）
  phase4: number; // 31-32 相位4 （单位 0.007度，范围-180~180度）
  phase5: number; // 33-34 相位5 （单位 0.007度，范围-180~180度）
  phase6: number; // 35-36 相位6 （单位 0.007度，范围-180~180度）
  phase7: number; // 37-38 相位7 （单位 0.007度，范围-180~180度）
  phase8: number; // 39-40 相位8 （单位 0.007度，范围-180~180度）
  phase9: number; // 41-42 相位9 （单位 0.007度，范围-180~180度）
  phase10: number; // 43-44 相位10 （单位 0.007度，范围-180~180度）
  phase11: number; // 45-46 相位11 （单位 0.007度，范围-180~180度）
  phase12: number; // 47-48 相位12 （单位 0.007度，范围-180~180度）
  phase13: number; // 49-50 相位13 （单位 0.007度，范围-180~180度）
  phase14: number; // 51-52 相位14 （单位 0.007度，范围-180~180度）
  phase15: number; // 53-54 相位15 （单位 0.007度，范围-180~180度）
  phase16: number; // 55-56 相位16 （单位 0.007度，范围-180~180度）
  amplitude1: number; // 57 数字幅度1（单位1dB）
  amplitude2: number; // 58 数字幅度1（单位1dB）
  amplitude3: number; // 59 数字幅度1（单位1dB）
  amplitude4: number; // 60 数字幅度1（单位1dB）
  amplitude5: number; // 61 数字幅度1（单位1dB）
  amplitude6: number; // 62 数字幅度1（单位1dB）
  amplitude7: number; // 63 数字幅度1（单位1dB）
  amplitude8: number; // 64 数字幅度1（单位1dB）
}

/**
 * 窄带全脉冲描述字
 */
export class NarrowBandFullPulseDescription {
  pdwToaTod: number; // 1-4bytes 单位：8ns
  pdwPw: number; // 5-8bytes 脉宽(单位：8ns)
  pdwWorkBand: number; // 波段码(单位 MHz)
  // 下面都没有英文 后面再说
}
