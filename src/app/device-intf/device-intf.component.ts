import {SettingService} from './../setting.service';
import {DatabaseService} from '../database.service';
import {IntermediateFrequencyControlPack, IntermediateFrequencyDataPack} from './../protocol/data-pack';
import {Subscription} from 'rxjs/Subscription';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {TcpService} from 'app/tcp.service';
import {DatePipe} from '@angular/common';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {Buffer} from 'buffer';

declare var electron: any; // 　Typescript 定义

@Component({
  selector: 'app-device-intf',
  templateUrl: './device-intf.component.html',
  styleUrls: ['./device-intf.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DeviceIntfComponent implements OnInit {
  dialog = electron.remote.dialog;
  fs = electron.remote.getGlobal('fs');
  subscription: Subscription;
  intf; // 参数
  // filter;
  proto: JSON;
  protoId;
  folderPath: 'C:';
  items = [];

  control: string;
  gps: string;
  host: string;
  time;

  serial: number = -1;

  constructor(private tcpService: TcpService,
              private _cd: ChangeDetectorRef,
              private datePipe: DatePipe,
              private snackBar: MdSnackBar,
              private _dbService: DatabaseService,
              private _settingService: SettingService) {
  }

  ngOnInit() {
    this.loadConfig();
    this.subscription = this.tcpService.getMessage().subscribe((msg: IntermediateFrequencyDataPack) => {
      console.log(`receive intermediate freq data pack, type: ${msg.type}`);
      if (msg.type === 4) {// 判断是中频数据
        this.host = msg.host;
        this.gps = [msg.gps.slice(0, 64), msg.gps.slice(64)].join('\n');
        this.control = [msg.control.slice(0, 64), msg.control.slice(64)].join('\n');
        this.time = this.datePipe.transform(msg.time, 'yyyy-MM-dd HH:mm:ss.') + msg.time.toString().substring(10, 13);
        if (msg.save) {
          this.exportData(msg.datas[0], msg.time);
        }

        this._cd.detectChanges(); // 检测更改，更新UI。
      }
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

  writeFile(fileName: string, content: any) {
    this.fs.writeFile(fileName, content, (err) => {
      if (err) {
        this.snackBar.open('CSV文件保存失败: ' + err.message);
        // alert('An error ocurred creating the file ' + err.message);
      } else {
        const config = new MdSnackBarConfig();
        config.duration = 5000;
        this.snackBar.open('CSV文件成功保存至: ' + fileName, null, config);
      }
    });
  }

  /**
   * 一个通道有两组数据，分别由高位和低位表示。
   * @param data
   * @returns {string}
   */
  data2csv(data: Buffer): string {
    let csv = '';
    for (let i = 0; i < data.length / 2; i++) {
      csv = csv + data.readInt16LE(i * 2); // 有符号的，所以是Int，否则是readUInt16LE
      if (i % 2 === 0) { // 如果是第一个数据，就后面加逗号，否则换行(0x0A)
        csv += ',';
      } else {
        csv += '\n'; // 最后一行可能会是一个空行，应该也不要紧，如果要紧就判断是最后两个字节后去掉
      }
    }
    return csv;
  }

  exportData(data: Buffer, time: number) {
    console.log('export data start');
    const content = this.data2csv(data);
    const defaultFileName = this.datePipe.transform(time, 'yyyyMMdd_HHmmss') + '_' + time.toString().substring(10, 13) + '.csv';
    this.writeFile(this.folderPath + '\\' + defaultFileName, content);
    // else { // 否则选择存储位置
    //   // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
    //   this.dialog.showErrorBox('路径错误', '请先选择保存位置');
    // }
  }

  selectPath() {
    this.dialog.showOpenDialog({
      title: '请选择保存位置',
      properties: ['openDirectory']
    }, (folderPaths) => {
      // folderPaths is an array that contains all the selected paths
      if (folderPaths === undefined) {
        console.log('No destination folder selected');
        return;
      } else {
        console.log(folderPaths);
        this.folderPath = folderPaths[0];
        this.saveConfig();
        this._cd.detectChanges(); // 检测更改，更新UI。
      }
    });
  }

  saveConfig() { // 保存中频配置到数据库
    const intf1 = {folderPath: this.folderPath};
    this._settingService.setIntf(JSON.stringify(intf1)).updateSettingToDB();
    // console.log('保存完成');
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
        type: -4
      },
    }).then(proto => {
      if (proto) {
        this.protoId = proto.id;
        this.items = this.generateIntfParams(proto.raw.toString());
      }
      // console.log(`proto raw: ${proto.raw}`);
    });

    this._settingService.fetchSettingFromDB().then(() => {
      try {
        const intf1 = JSON.parse(this._settingService.intf);
        this.folderPath = intf1.folderPath;
      } catch (e) {
        console.error(`error parser intf params, ${e}`);
      }
      this._cd.detectChanges(); // 检测更改，更新UI。

      // Test save file
      // const content = '1222,2222\n2222';
      // const now = new Date();
      // const defaultFileName = this.datePipe.transform(now, 'yyyyMMdd_HHmmss') + '_' + now.getMilliseconds() + '.csv';
      // if (this.intf.folderPath) {// 选定了默认位置，直接存储
      //   this.writeFile(this.intf.folderPath + '\\' + defaultFileName, content);
      // }

    });
  }

}
