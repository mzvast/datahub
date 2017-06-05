import { Buffer } from 'buffer';
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
export class TagDataPack extends BaseDescriptionDataPack {
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
  parserDescription(data: string): TagDataPackDescription {
    const desc = new TagDataPackDescription();
    const dataHex = Buffer.from(data, 'hex');
    desc.sourceNodeNo = dataHex.readUInt8(136, false);
    desc.destNodeNo = dataHex.readUInt8(137, false);
    desc.feedbackCommandNo = dataHex.readUInt16BE(138, false);
    desc.commandReceiveStatus0 = dataHex.readUInt8(140, false);
    desc.commandReceiveStatus1 = dataHex.readUInt8(141, false);
    desc.taskNo = dataHex.readUInt16BE(142, false);
    desc.frontWorkTemp = dataHex.readUInt16BE(144, false);
    desc.extWorkTemp = dataHex.readUInt16BE(146, false);
    desc.extWorkStatus0 = dataHex.readUInt8(148, false);
    desc.extWorkStatus1 = dataHex.readUInt8(149, false);
    // 文档写上面的status用4字节，那就跳过2个字节
    desc.fullPulseCount = dataHex.readUInt32BE(152, false);
    desc.radiationSourceCount = dataHex.readUInt32BE(156, false);
    desc.ifDataLen = dataHex.readUInt32BE(160, false);
    desc.backup = dataHex.slice(164, 164 + 16).toString('hex');
    desc.frontStatusFeedback = dataHex.slice(180, 180 + 128).toString('hex');
    return desc;
  }
}

export class TagDataPackDescription {
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
}
/**
 * 标签包字典
 */
export class TagDataPackDictionary {
  sourceNodeNo = ' 发方节点号1'; // 发方节点号1
  destNodeNo = ' 收方节点号1'; // 收方节点号1
  feedbackCommandNo = ' 反馈指令序号2'; // 反馈指令序号2
  commandReceiveStatus0 = ' 指令接收状态1'; // 指令接收状态1 0 指令接收正常；1指令接收出现丢帧；
  commandReceiveStatus1 = ' 指令接收状态1'; // 指令接收状态1 0 指令解析正常；1 指令解析异常
  taskNo = ' 任务编号2'; // 任务编号2
  frontWorkTemp = ' 前端工作温度2'; // 前端工作温度2
  extWorkTemp = ' 分机工作温度2'; // 分机工作温度2
  extWorkStatus0 = ' 分机工作状态1'; // 分机工作状态1 信道化组件状态 0：正常，1：不正常 TODO 我觉得应该是2字节 文档写4字节
  extWorkStatus1 = ' 分机工作状态1'; // 分机工作状态1 信号分选组件状态 0：正常，1：不正常
  fullPulseCount = ' 全脉冲个数统计4'; // 全脉冲个数统计4
  radiationSourceCount = ' 辐射源数据包统计4'; // 辐射源数据包统计4
  ifDataLen = ' 中频数据统计4'; // 中频数据统计4
  // backup: string; // 备份16
  // frontStatusFeedback: string; // 前端状态反馈128,没说具体是什么，方便存储，用string
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

  // getDictionary(): BroadBandRadiationDictionary {
  //   return new BroadBandRadiationDictionary();
  // }

  parserDescription(data: string): BroadBandRadiationDescription {
    const des = new BroadBandRadiationDescription();
    const dataHex = Buffer.from(data, 'hex');
    des.radiationSourceNum = dataHex.readUInt16BE(2, false);
    des.firstArriveTime = dataHex.readUInt32BE(4, false);
    des.rfExtType = dataHex.readUInt8(8, false);
    des.rfIntType = dataHex.readUInt8(9, false);
    des.rfNum = dataHex.readUInt16BE(10, false);
    des.rfNumInGrp = dataHex.readUInt16BE(12, false);
    des.rf1 = dataHex.readUInt32BE(16, false);
    des.rf2 = dataHex.readUInt32BE(20, false);
    des.rf3 = dataHex.readUInt32BE(24, false);
    des.rf4 = dataHex.readUInt32BE(28, false);
    des.rf5 = dataHex.readUInt32BE(32, false);
    des.rf6 = dataHex.readUInt32BE(36, false);
    des.rf7 = dataHex.readUInt32BE(40, false);
    des.rf8 = dataHex.readUInt32BE(44, false);

    des.rpiType = dataHex.readUInt16BE(48, false);
    des.rpiNum = dataHex.readUInt16BE(50, false);
    des.rpiNumInGrp = dataHex.readUInt32BE(52, false);
    des.rpi1 = dataHex.readInt32BE(56, false);
    des.rpi2 = dataHex.readInt32BE(60, false);
    des.rpi3 = dataHex.readInt32BE(64, false);
    des.rpi4 = dataHex.readInt32BE(68, false);
    des.rpi5 = dataHex.readInt32BE(72, false);
    des.rpi6 = dataHex.readInt32BE(76, false);
    des.rpi7 = dataHex.readInt32BE(80, false);
    des.rpi8 = dataHex.readInt32BE(84, false);

    des.pwType = dataHex.readInt16BE(88, false);
    des.pwNum = dataHex.readInt16BE(90, false);
    des.pwNumInGrp = dataHex.readInt32BE(92, false);
    des.pw1 = dataHex.readInt32BE(96, false);
    des.pw2 = dataHex.readInt32BE(100, false);
    des.pw3 = dataHex.readInt32BE(104, false);
    des.pw4 = dataHex.readInt32BE(108, false);
    des.pw5 = dataHex.readInt32BE(112, false);
    des.pw6 = dataHex.readInt32BE(116, false);
    des.pw7 = dataHex.readInt32BE(120, false);
    des.pw8 = dataHex.readInt32BE(124, false);
    des.pa = dataHex.readInt32BE(128, false);

    des.azimuth1 = dataHex.readInt16BE(132, false);
    des.elevationAngle1 = dataHex.readInt16BE(134, false);
    des.azimuth2 = dataHex.readInt16BE(136, false);
    des.elevationAngle2 = dataHex.readInt16BE(138, false);
    des.azimuth3 = dataHex.readInt16BE(140, false);
    des.elevationAngle3 = dataHex.readInt16BE(142, false);
    des.azimuth4 = dataHex.readInt16BE(144, false);
    des.elevationAngle4 = dataHex.readInt16BE(146, false);

    des.locationInfo = dataHex.readInt32BE(148, false);
    des.validFlag = dataHex.readInt32BE(152, false);
    return des;
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
 * 全脉冲字典
 */
export class BroadBandFullPulseDictionary {
  pdwToaTod = '到达时间'; // 1-4bytes 到达时间(单位 4.46ns)
  pdwPw = '脉宽'; // 5-8bytes 脉宽(单位 4.46ns)
  pdwVpcnt = '脉冲计数'; // 9-10bytes 脉冲计数
  pdwWorkBand = '波段码'; // 11-12bytes 波段码(单位 MHz)
  trackerFreRise = '前沿频率'; // 13-14bytes 前沿频率(单位 0.01MHz)
  trackerFreMinOv = '最小频率/频率1'; // 15-16bytes 最小频率，当分集信号时，为频率1(单位 0.01MHz)
  trackerFreMaxOv = '最大频率/频率2'; // 17-18bytes 最大频率，当分集信号时，为频率2(单位 0.01MHz)
  trackerFre3 = '频率3'; // 19-20bytes 当分集信号时，为频率3(单位 0.01MHz)
  trackerFre4 = '频率4'; // 21-22bytes 当分集信号时，为频率4(单位 0.01MHz)
  pdwType = '脉冲类型'; // 23 脉冲类型;  Bit0-1： Bit2-3：0-脉冲Pdw，1-连续波Pdw,3-分集信号 Bit4-7：分集个数
  trackerOrien = '线调标记'; // 24 线调标记； 0表示递增， 1表示递减， 2表示混合， 3 表示不是线调
  phase1 = '相位1'; // 25-26 相位1 （单位 0.007度，范围-180~180度）
  phase2 = '相位2'; // 27-28 相位2 （单位 0.007度，范围-180~180度）
  phase3 = '相位3'; // 29-30 相位3 （单位 0.007度，范围-180~180度）
  phase4 = '相位4'; // 31-32 相位4 （单位 0.007度，范围-180~180度）
  phase5 = '相位5'; // 33-34 相位5 （单位 0.007度，范围-180~180度）
  phase6 = '相位6'; // 35-36 相位6 （单位 0.007度，范围-180~180度）
  phase7 = '相位7'; // 37-38 相位7 （单位 0.007度，范围-180~180度）
  phase8 = '相位8'; // 39-40 相位8 （单位 0.007度，范围-180~180度）
  phase9 = '相位9'; // 41-42 相位9 （单位 0.007度，范围-180~180度）
  phase10 = '相位10'; // 43-44 相位10 （单位 0.007度，范围-180~180度）
  phase11 = '相位11'; // 45-46 相位11 （单位 0.007度，范围-180~180度）
  phase12 = '相位12'; // 47-48 相位12 （单位 0.007度，范围-180~180度）
  phase13 = '相位13'; // 49-50 相位13 （单位 0.007度，范围-180~180度）
  phase14 = '相位14'; // 51-52 相位14 （单位 0.007度，范围-180~180度）
  phase15 = '相位15'; // 53-54 相位15 （单位 0.007度，范围-180~180度）
  phase16 = '相位16'; // 55-56 相位16 （单位 0.007度，范围-180~180度）
  amplitude1 = '数字幅度1'; // 57 数字幅度1（单位1dB）
  amplitude2 = '数字幅度2'; // 58 数字幅度2（单位1dB）
  amplitude3 = '数字幅度3'; // 59 数字幅度3（单位1dB）
  amplitude4 = '数字幅度4'; // 60 数字幅度4（单位1dB）
  amplitude5 = '数字幅度5'; // 61 数字幅度5（单位1dB）
  amplitude6 = '数字幅度6'; // 62 数字幅度6（单位1dB）
  amplitude7 = '数字幅度7'; // 63 数字幅度7（单位1dB）
  amplitude8 = '数字幅度8'; // 64 数字幅度8（单位1dB）
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

export class BroadBandRadiationDescription {
  radiationSourceNum: number; // 3-4 辐射源序号
  firstArriveTime: number; // 5-8 到达时间
  /**
   * 载频
   */
  rfExtType: number; // 9 脉间类型
  rfIntType: number; // 10  脉内类型
  rfNum: number; // 11-12  个数
  rfNumInGrp: number; // 13-14  脉组内脉冲数
  // backup: number; // 15-16  备份
  rf1: number; // 17-20 RF1
  rf2: number; // 21-24 RF2
  rf3: number; // 25-28 RF3
  rf4: number; // 29-32 RF4
  rf5: number; // 33-36 RF5
  rf6: number; // 37-40 RF6
  rf7: number; // 41-44 RF7
  rf8: number; // 45-48 RF8
  /**
   * 重频repete frequency
   */
  rpiType: number; // 49-50 类型
  rpiNum: number; // 51-52  个数
  rpiNumInGrp: number; // 53-56  脉组内脉冲数
  rpi1: number; // 57-60 rpi1
  rpi2: number; // 61-64 rpi2
  rpi3: number; // 65-68 rpi3
  rpi4: number; // 69-72 rpi4
  rpi5: number; // 73-76 rpi5
  rpi6: number; // 77-80 rpi6
  rpi7: number; // 81-84 rpi7
  rpi8: number; // 85-88 rpi8
  /**
   * 脉宽
   */
  pwType: number; // 89-90 类型
  pwNum: number; // 91-92 个数
  pwNumInGrp: number; // 93-96 脉组内脉冲数
  pw1: number; // 97-100 pw1
  pw2: number; // 101-104 pw2
  pw3: number; // 105-108 pw3
  pw4: number; // 109-112 pw4
  pw5: number; // 113-116 pw5
  pw6: number; // 117-120 pw6
  pw7: number; // 121-124 pw7
  pw8: number; // 125-128 pw8
  pa: number; // 129-132 PA 脉幅(平均)
  /**
   * 位置信息（可调）
   */
  azimuth1: number; // 133-134 方位角 单位：0.1度
  elevationAngle1: number; // 135-136 仰角 单位：0.1度
  azimuth2: number; // 137-138 方位角 单位：0.1度
  elevationAngle2: number; // 139-140 单位：0.1度
  azimuth3: number; // 141-142 方位角 单位：0.1度
  elevationAngle3: number; // 143-144 仰角 单位：0.1度
  azimuth4: number; // 145-146 方位角 单位：0.1度
  elevationAngle4: number; // 147-148 仰角 单位：0.1度
  /**
   * 定位结果（可调）
   */
  locationInfo: number; // 149-152 位置信息
  /**
   * 脉内调制信息（可调）
   */
  validFlag: number; // 153-156 脉内有效标志
  // idInfo: number; // 157-272 脉内特征信息
}
/**
 * 辐射源字典
 */
export class BroadBandRadiationDictionary {
  radiationSourceNum = '辐射源序号'; // 3-4 辐射源序号
  firstArriveTime = '到达时间'; // 5-8 到达时间
  /**
   * 载频
   */
  rfExtType = '载频|脉间类型'; // 9 脉间类型
  rfIntType = '载频|脉内类型'; // 10  脉内类型
  rfNum = '载频|个数'; // 11-12  个数
  rfNumInGrp = '载频|脉冲数'; // 13-14  脉组内脉冲数
  // backup = '载频|'; // 15-16  备份
  rf1 = '载频|RF1'; // 17-20 RF1
  rf2 = '载频|RF2'; // 21-24 RF2
  rf3 = '载频|RF3'; // 25-28 RF3
  rf4 = '载频|RF4'; // 29-32 RF4
  rf5 = '载频|RF5'; // 33-36 RF5
  rf6 = '载频|RF6'; // 37-40 RF6
  rf7 = '载频|RF7'; // 41-44 RF7
  rf8 = '载频|RF8'; // 45-48 RF8
  /**
   * 重频repete frequency
   */
  rpiType = '重频|类型'; // 49-50 类型
  rpiNum = '重频|个数'; // 51-52  个数
  rpiNumInGrp = '重频|脉冲数'; // 53-56  脉组内脉冲数
  rpi1 = '重频|rpi1'; // 57-60 rpi1
  rpi2 = '重频|rpi2'; // 61-64 rpi2
  rpi3 = '重频|rpi3'; // 65-68 rpi3
  rpi4 = '重频|rpi4'; // 69-72 rpi4
  rpi5 = '重频|rpi5'; // 73-76 rpi5
  rpi6 = '重频|rpi6'; // 77-80 rpi6
  rpi7 = '重频|rpi7'; // 81-84 rpi7
  rpi8 = '重频|rpi8'; // 85-88 rpi8
  /**
   * 脉宽
   */
  pwType = '脉宽|类型'; // 89-90 类型
  pwNum = '脉宽|个数'; // 91-92 个数
  pwNumInGrp = '脉宽|脉冲数'; // 93-96 脉组内脉冲数
  pw1 = '脉宽|pw1'; // 97-100 pw1
  pw2 = '脉宽|pw2'; // 101-104 pw2
  pw3 = '脉宽|pw3'; // 105-108 pw3
  pw4 = '脉宽|pw4'; // 109-112 pw4
  pw5 = '脉宽|pw5'; // 113-116 pw5
  pw6 = '脉宽|pw6'; // 117-120 pw6
  pw7 = '脉宽|pw7'; // 121-124 pw7
  pw8 = '脉宽|pw8'; // 125-128 pw8
  pa = '脉宽|PA脉幅'; // 129-132 PA脉幅(平均)
  /**
   * 位置信息（可调）
   */
  azimuth1 = '位置|方位角1'; // 133-134 方位角 单位：0.1度
  elevationAngle1 = '位置|仰角1'; // 135-136 仰角 单位：0.1度
  azimuth2 = '位置|方位角2'; // 137-138 方位角 单位：0.1度
  elevationAngle2 = '位置|仰角2'; // 139-140 仰角 单位：0.1度
  azimuth3 = '位置|方位角3'; // 141-142 方位角 单位：0.1度
  elevationAngle3 = '位置|仰角3'; // 143-144 仰角 单位：0.1度
  azimuth4 = '位置|方位角4'; // 145-146 方位角 单位：0.1度
  elevationAngle4 = '位置|仰角4'; // 147-148 仰角 单位：0.1度
  /**
   * 定位结果（可调）
   */
  locationInfo = '定位'; // 149-152 位置信息
  /**
   * 脉内调制信息（可调）
   */
  validFlag = '脉内调制|有效'; // 153-156 脉内有效标志
  // idInfo: number; // 157-272 脉内特征信息
}
