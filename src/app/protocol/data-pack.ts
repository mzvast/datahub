import {Buffer} from 'buffer';

/**
 * Created by Terry on 2017-5-26.
 */

/**
 * 数据基类
 */
export class BaseDataPack {
  host: string; // 来自哪个IP
  // private head = 0x1ACF; // 帧有效标记2
  type: number; // 数据类型 2
  // private len: number; // 数据长度 4
  control: string; // 系统控制信息64，没说具体是什么，方便存储，用string，转成string hex
  gps: string; // GPS数据4，没说具体是什么，方便存储，用string，转成string hex

  proto: JSON; // 解析用的自定义协议
  protoId: number; // 解析用的自定义协议ID

  // saveFlag = true; // 主要用在中频那边，如果是saveFlag false就不要保存

  // 接下来数据信息
  // 固定信息
  // private end: number; // 包尾4, 0x0000FC1D

  datas: Array<Buffer> = new Array();

  constructor(host: string, control: string, gps: string) {
    this.host = host;
    this.control = control;
    this.gps = gps;
  }

  parserValue(index: number, b: number, data: Buffer, item: JSON) {
    if (index + b > data.length) {
      console.log(`parser item index out of bound, index: ${index + b}, bound: ${data.length}`);
      return null;
    }
    const unit = item.hasOwnProperty('unit') ? item['unit'] : '';
    // name = name + unit;
    const type = item['type'];
    let value = '';
    if (type === 'string') {
      value = data.slice(index, index + b).toString('hex');
    } else {
      let v = data.readIntLE(index, b);
      if (type === 'number') {
        if (item.hasOwnProperty('enum')) {
          const v2 = this.findEnum(item['enum'], v);
          value = v2 ? v2 : ('<font color=\"red\">未知' + v + '</font>');
        } else {
          if (item.hasOwnProperty('multiple')) {
            const multiple = item['multiple'];
            v = v * multiple;
          }
          value = v + unit;
          // value = v + '';
        }
      } else if (type === 'flag') {
        if (v === 0) {
          value = '<font color=\"blue\">' + item['flag0'] + '</font>';
        } else {
          value = '<font color=\"red\">' + item['flag0'] + '</font>';
        }
      }
    }

    return value;
  }

  parseDataItems(start: number, len: number): any {
    const items = [];
    let index = 0;
    outer: for (const key in this.proto) {
      if (this.proto.hasOwnProperty(key)) {
        const item = this.proto[key];
        const b = item['bytes'];
        if (item.hasOwnProperty('hide')) {
          const hideValue = item['hide'];
          if (typeof hideValue === 'boolean' && hideValue === false) {
            // 如果hide是false就不要忽略了
          } else {
            index = index + b;
            continue;
          }

        }
        const name = item['name'];
        const obj = {};
        obj['name'] = name;
        const values = [];
        for (let j = start; j < start + len; j++) {
          const value = this.parserValue(index, b, this.datas[j], item);
          if (value == null) {
            break outer;
          } else {
            values.push(value);
          }
        }
        obj['value'] = values;
        items.push(obj);
        index = index + b;
      }
    }
    return items;
  }

  findEnum(e: string, v: number): string {
    const es = e.split(',');
    for (let i = 0; i < es.length; i++) {
      const esitems = es[i].split(':');
      if (esitems.length === 2) {
        if (v === parseInt(esitems[0], 10)) {
          return esitems[0];
        }
      }
    }
    return null;
  }


}

/**
 * 标签包0 312字节
 */
export class TagDataPack extends BaseDataPack {

  constructor(host: string, control: string, gps: string) {
    super(host, control, gps);
    this.type = 0;
  }

  description() {
    return `[TagDataPack] control: ${this.control}, gps: ${this.gps}, datas length: ${this.datas.length}`;
  }
}

/**
 * 窄带全脉冲数据包1
 */
export class NarrowBandFullPulseDataPack extends BaseDataPack {

  constructor(host: string, control: string, gps: string) {
    super(host, control, gps);
    this.type = 1;
  }

  description() {
    return `[NarrowBandFullPulseDataPack] control: ${this.control}, gps: ${this.gps}, ` +
      `datas length: ${this.datas.length}`;
  }
}

/**
 * 窄带辐射源数据包5
 */
export class NarrowBandSourceDataPack extends BaseDataPack {
  constructor(host: string, control: string, gps: string) {
    super(host, control, gps);
    this.type = 5;
  }

  description() {
    return `[NarrowBandSourceDataPack] control: ${this.control}, gps: ${this.gps}, ` +
      `datas length: ${this.datas.length}`;
  }

}

/**
 * 中频数据包4
 */
export class IntermediateFrequencyDataPack extends BaseDataPack {

  constructor(host: string, control: string, gps: string) {
    super(host, control, gps);
    this.type = 4;
  }

  description() {
    return `[IntermediateFrequencyDataPack] control: ${this.control}, gps: ${this.gps}, ` +
      `datas length: ${this.datas.length}`;
  }
}

/**
 * 控制指令
 */
class BaseControlPack {
  head = 0x1ACF; // 包头
  serial: number; // 信息包序号2
  time: Buffer; // 时间码 依次为：时（字节）：分（字节）：秒（字，单位：ms）、日（字节）：月（字节）：年（字）
  end = 0xFC1D; // 包尾

  constructor() {
    const nowTime = new Date();
    this.time = Buffer.allocUnsafe(8);
    this.time.writeInt8(nowTime.getHours(), 0);
    this.time.writeInt8(nowTime.getMinutes(), 1);
    this.time.writeInt16LE(nowTime.getMilliseconds(), 2);
    this.time.writeInt8(nowTime.getDate(), 4);
    this.time.writeInt8(nowTime.getMonth(), 5);
    this.time.writeInt16LE(nowTime.getFullYear(), 6);
  }

  numberToBuffer(num: number, length: number) {
    const data = Buffer.allocUnsafe(length);
    data.writeIntLE(num, 0, length, true);
    return data;
  }
}

/**
 * 中频控制指令
 */
export class IntermediateFrequencyControlPack extends BaseControlPack {
  workType: number; // 工作方式1字节 0：实时校正模式；1：自检模式；2：搜索模式；(默认工作模式) 3：跟踪模式；
  broadband: number; // 带宽选择1字节 0：40M；1：400M
  workPeriod: number; // 工作周期数2字节 0：表示长期驻留；其它：工作周期数
  workPeriodCount: number; // 工作周期计数4字节 按工作周期递增 工作周期就是计数了，不需要设的(那就暂时和serial一样吧)
  workPeriodLength: number; // 工作周期长度1字节 单位：20ms； 默认值为50
  attenuationCode1: number; // 衰减码1 1字节 0：不衰减，1：衰减20dB；
  attenuationCode2: number; // 衰减码2 1字节 单位：dB，取值范围：0～35，步进5dB
  frontWorkModel: number; // 前端工作模式设置1字节 0：直通，1：放大
  workCenterFreq: number; // 工作中心频率 2字节
  singlePoleFiveRolls: number; // LOL网上翻译的！ 单刀五掷1字节 有效位数3位，测频通道选择，通道1-7
  // backup0: number; // 备份6字节
  excludePulseThreshold: number; // 脉宽剔除门限值1字节
  sideProcessPulseCount: number; // 测向处理脉冲个数1字节
  intermediateFrequencyCollectTime: number; // 中频采集时间1字节
  azimuthSearchStart: number; // 方位角搜索起始值2字节
  azimuthSearchEnd: number; // 方位角搜索终止值2字节
  elevationSearchStart: number; // 仰角搜索起始值2字节
  elevationSearchEnd: number; // 仰角搜索终止值2字节
  azimuthSearchStepLength: number; // 方位角粗搜索步长1字节
  elevationSearchStepLength: number; // 仰角粗搜索步长1字节
  countEstimatedThreshold: number; // 个数估计门限1字节
  attackCriterionSelect: number; // 攻击准则选择1字节
  pulseMatchTolerance: number; // 脉宽匹配容差4字节
  priMatchTolerance: number; // PRI匹配容差4字节
  extControl: number; // 分机控制4字节
  // backup1: number; // 备份2字节

  constructor(serial: number) {
    super();
    this.serial = serial;
    // 陈博士回复 工作周期就是计数了，不需要设的(那就暂时和serial一样吧)
    this.workPeriodCount = this.serial;
  }

  /**
   * 把这个包 包装成Buffer，可以准备发了 64个字节
   * @returns {Buffer}
   */
  packageMessage() {
    // this.numberToBuffer(0xFC, 1);
    return Buffer.concat([
      this.numberToBuffer(this.head, 2),
      this.numberToBuffer(this.serial, 2),
      this.time,
      this.numberToBuffer(this.workType, 1),
      this.numberToBuffer(this.broadband, 1),
      this.numberToBuffer(this.workPeriod, 2),
      this.numberToBuffer(this.workPeriodCount, 4),
      this.numberToBuffer(this.workPeriodLength, 1),
      this.numberToBuffer(this.attenuationCode1, 1),
      this.numberToBuffer(this.attenuationCode2, 1),
      this.numberToBuffer(this.frontWorkModel, 1),
      this.numberToBuffer(this.workCenterFreq, 2),
      this.numberToBuffer(this.singlePoleFiveRolls, 1),
      Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), // 备份6字节
      this.numberToBuffer(this.excludePulseThreshold, 1),
      this.numberToBuffer(this.sideProcessPulseCount, 1),
      this.numberToBuffer(this.intermediateFrequencyCollectTime, 1),
      this.numberToBuffer(this.azimuthSearchStart, 2),
      this.numberToBuffer(this.azimuthSearchEnd, 2),
      this.numberToBuffer(this.elevationSearchStart, 2),
      this.numberToBuffer(this.elevationSearchEnd, 2),
      this.numberToBuffer(this.azimuthSearchStepLength, 1),
      this.numberToBuffer(this.elevationSearchStepLength, 1),
      this.numberToBuffer(this.countEstimatedThreshold, 1),
      this.numberToBuffer(this.attackCriterionSelect, 1),
      this.numberToBuffer(this.pulseMatchTolerance, 4),
      this.numberToBuffer(this.priMatchTolerance, 4),
      this.numberToBuffer(this.extControl, 4),
      Buffer.from([0x00, 0x00]), // 备份2字节
      this.numberToBuffer(this.end, 2)
    ]);
  }
}
