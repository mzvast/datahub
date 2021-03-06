import {Buffer} from 'buffer';

/**
 * Created by Terry on 2017-5-26.
 */

/**
 * 数据基类
 */
export class BaseDataPack {
  time: number; // 接收时间
  host: string; // 来自哪个IP
  // private head = 0x1ACF; // 帧有效标记2
  type: number; // 数据类型 2
  // private len: number; // 数据长度 4
  control: string; // 系统控制信息64，没说具体是什么，方便存储，用string，转成string hex
  gps: string; // GPS数据4，没说具体是什么，方便存储，用string，转成string hex

  proto: JSON; // 解析用的自定义协议
  protoId: number; // 解析用的自定义协议ID
  save = false;

  // saveFlag = true; // 主要用在中频那边，如果是saveFlag false就不要保存

  // 接下来数据信息
  // 固定信息
  // private end: number; // 包尾4, 0x0000FC1D

  datas: Array<Buffer> = new Array();

  constructor(host: string, control: string, gps: string) {
    this.host = host;
    this.control = control;
    this.gps = gps;
    this.time = new Date().getTime();
  }

  parserValue(index: number, b: number, data: Buffer, item: JSON) {
    if (data instanceof Buffer === false) {
      return null;
    }
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
            value = this.formatNumber(v) + unit;
          } else {
            value = v + unit;
          }
          // value = v + '';
        }
      } else if (type === 'flag') {
        if (v === 0) {
          value = '<font color=\"blue\">' + item['flag0'] + '</font>';
        } else {
          value = '<font color=\"red\">' + item['flag1'] + '</font>';
        }
      }
    }

    return value;
  }

  formatNumber(num: number) {
    const string = num.toFixed(2);
    if (string.endsWith('.00')) {
      return num.toFixed(0);
    }
    return string;
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
  // serial: number; // 信息包序号2
  // time: Buffer; // 时间码 依次为：时（字节）：分（字节）：秒（字，单位：ms）、日（字节）：月（字节）：年（字）
  end = 0xFC1D; // 包尾
  data: Buffer; // 发送的数据，不包含头和尾

  constructor() {

  }

  timestamp() {
    const nowTime = new Date();
    const time = Buffer.allocUnsafe(8);
    time.writeInt8(nowTime.getHours(), 0);
    time.writeInt8(nowTime.getMinutes(), 1);
    time.writeInt16LE(nowTime.getMilliseconds(), 2);
    time.writeInt8(nowTime.getDate(), 4);
    time.writeInt8(nowTime.getMonth(), 5);
    time.writeInt16LE(nowTime.getFullYear(), 6);
    return time;
  }

  numberToBuffer(num: number, length: number) {
    const data = Buffer.allocUnsafe(length);
    data.writeIntLE(num, 0, length, true);
    return data;
  }

  stringToBuffer(str: string, length: number) {
    const data = Buffer.allocUnsafe(length);
    data.write(str, 0, length);
    return data;
  }
}

/**
 * 中频控制指令
 */
export class IntermediateFrequencyControlPack extends BaseControlPack {

  constructor() {
    super();
  }

  /**
   * 把这个包 包装成Buffer，可以准备发了 64个字节
   * @returns {Buffer}
   */
  packageMessage() {
    // this.numberToBuffer(0xFC, 1);
    return Buffer.concat([
      this.numberToBuffer(this.head, 2),
      this.data,
      // Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), // 备份6字节
      // Buffer.from([0x00, 0x00]), // 备份2字节
      this.numberToBuffer(this.end, 2)
    ]);
  }
}
