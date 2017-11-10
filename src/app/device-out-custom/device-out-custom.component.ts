import {SettingService} from './../setting.service';
import {DatabaseService} from '../database.service';
import {IntermediateFrequencyControlPack} from './../protocol/data-pack';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {TcpService} from 'app/tcp.service';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {Buffer} from 'buffer';
import {ActivatedRoute} from '@angular/router';

declare var electron: any; // 　Typescript 定义

@Component({
  selector: 'app-device-out-custom',
  templateUrl: './device-out-custom.component.html',
  styleUrls: ['./device-out-custom.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DeviceOutCustomComponent implements OnInit {
  private sub: any;

  custom: number;
  intf; // 参数
  // filter;
  proto: JSON;
  protoId;
  items = [];

  control: string;
  gps: string;
  host: string;
  time;

  serial: number = -1;

  constructor(private route: ActivatedRoute,
              private tcpService: TcpService,
              private snackBar: MdSnackBar,
              private _dbService: DatabaseService) {
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.custom = params['custom'];
      // console.log(`this.custom: ${this.custom}`);
      this.loadConfig();
    });
  }


  sendRequest() {
    this.serial++;
    if (this.serial >= 65535) {
      this.serial = 0;
    }
    const pack = new IntermediateFrequencyControlPack();
    let index = -1;
    const buffers = [];
    for (const key in this.proto) {
      if (this.proto.hasOwnProperty(key)) {
        const item = this.proto[key];
        index++;
        const type = item['type'];
        const b = item['bytes'];
        if (type === 'increase') {
          buffers.push(pack.numberToBuffer(this.serial, b));
          continue;
        }
        if (type === 'timestamp') {
          buffers.push(pack.timestamp());
          continue;
        }
        item.type = type;
        let value = this.intf[index];
        if (value) {

        } else {
          value = item['value'];
        }
        if (type === 'number') {
          buffers.push(pack.numberToBuffer(value ? value : 0, b));
        } else {
          buffers.push(pack.stringToBuffer(value ? value : 0, b));
        }
      }
    }
    pack.data = Buffer.concat(buffers);
    this.tcpService.sendIntFreqRequest(pack);
    this.saveProtoValue(false);
  }

  saveProtoValueAndToast() {
    this.saveProtoValue(true);
  }

  cleanProto(json: JSON) {
    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        const item = json[key];
        if (item.hasOwnProperty('index')) {
          delete item['index'];
        }
      }
    }
    return json;
  }

  saveProtoValue(toast: boolean) {
    let index = -1;
    for (const key in this.proto) {
      if (this.proto.hasOwnProperty(key)) {
        const item = this.proto[key];
        index++;
        const type = item['type'];
        const valueInIntf = this.intf[index];
        if (type === 'number') {
          item['value'] = valueInIntf;
        } else if (type === 'string') {
          item['value'] = valueInIntf;
        }
      }
    }
    // console.log(JSON.stringify(this.proto));
    const that = this;
    const cloneProto = JSON.parse(JSON.stringify(this.proto));
    this._dbService.models['proto'].update(
      {raw: JSON.stringify(this.cleanProto(cloneProto))}, {where: {id: this.protoId}}
    ).then(() => {
        if (toast) {
          that.showToast('保存成功');
        }
      }
    );
  }

  valueCopied(value) {
    if (!value) {
      return;
    }
    if (value.length > 64) {
      value = value.substr(0, 64) + '...';
    }
    this.showToast('已复制: ' + value);
  }

  generateIntfParams(raw: string) {
    this.proto = JSON.parse(raw);
    const items = [];
    let index = -1;
    for (const key in this.proto) {
      if (this.proto.hasOwnProperty(key)) {
        const item = this.proto[key];
        index++;
        if (item.hasOwnProperty('hide')) {
          const hideValue = item['hide'];
          if (typeof hideValue === 'boolean' && hideValue === false) {
            // 如果hide是false就不要忽略了
          } else {
            continue;
          }
        }
        const type = item['type'];
        item.type = type;
        if (type === 'number' || type === 'string') {
          // 只有number和string需要
        } else {
          continue;
        }
        const name = item['name'];
        item.name = name;
        if (item.hasOwnProperty('enum')) {
          item.enums = this.parserEnums(item['enum']);
        }

        const placeholder = item['placeholder'];
        item.placeholder = placeholder;
        this.intf[index] = item['value'];

        item['index'] = index;
        items.push(item);
      }
    }
    return items;
  }

  parserEnums(str: string) {
    const enums = str.split(',');
    const items = [];
    for (let i = 0; i < enums.length; i++) {
      const item = enums[i].split(':');
      items.push({code: parseInt(item[0], 10), name: item[1]});
    }
    return items;
  }

  showToast(message: string) {
    const config = new MdSnackBarConfig();
    config.duration = 5000;
    this.snackBar.open(message, null, config);
  }

  loadConfig() { // 读取中频配置
    this.intf = new Object();
    this._dbService.models['proto'].findOne({
      where: {
        in_use: 1,
        type: this.custom
      },
    }).then(proto => {
      if (proto) {
        this.protoId = proto.id;
        this.items = this.generateIntfParams(proto.raw.toString());
      }
      // console.log(`proto raw: ${proto.raw}`);
    });

  }

}
