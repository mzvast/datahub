/**
 * Created by Terry on 2017-5-26.
 */

/**
 * 数据基类
 */
export class BaseDataPack {
  // private head = 0x1ACF; // 帧有效标记2
  // private type; // 数据类型 2
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
  }

  description() {
    return `[narrow band data pack] control: ${this.control}, gps: ${this.gps}, ` +
      `fullPulseDescriptions length: ${this.datas.length}`;
  }
}

/**
 * 宽带全脉冲数据包2
 */
export class BroadBandFullPulseDataPack extends BaseDescriptionDataPack {

  constructor(control: string, gps: string) {
    super(control, gps);
  }

  description() {
    return `[broad band data pack] control: ${this.control}, gps: ${this.gps}, ` +
      `fullPulseDescriptions length: ${this.datas.length}`;
  }
}

/**
 * 宽带辐射源数据包3
 */
export class BroadBandSourceDataPack extends BaseDescriptionDataPack {
  constructor(control: string, gps: string) {
    super(control, gps);
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
  }

  description() {
    return `[positioning data pack] control: ${this.control}, gps: ${this.gps}, ` +
      `backup: ${this.backup}`;
  }
}
