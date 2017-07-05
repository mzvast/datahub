import { SettingService } from './../setting.service';
import { IntermediateFrequencyControlPack, IntermediateFrequencyDataPack } from './../protocol/data-pack';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { UdpService } from 'app/udp.service';
import { Buffer } from 'buffer';

declare var electron: any; // 　Typescript 定义

@Component({
  selector: 'app-device-intf',
  templateUrl: './device-intf.component.html',
  styleUrls: ['./device-intf.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DeviceIntfComponent implements OnInit {
  directSaveFlag = true; // true直接保存, false弹出位置选择
  folderPath: string;
  dialog = electron.remote.dialog;
  fs = electron.remote.getGlobal('fs');
  timeVal = 1;
  timeMax = 25;
  timeMin = 0.1;
  subscription: Subscription;
  intf: string;

  data: Buffer; // 中频的数据
  serial: number = -1;

  // 参数
  workType = 2;
  broadband = 1;
  workPeriod = 0;
  workPeriodLength = 50;
  attenuationCode1 = 1;
  attenuationCode2 = 0;
  frontWorkModel = 1;
  workCenterFreq = 1;
  singlePoleFiveRolls = 0;
  excludePulseThreshold = 0;
  sideProcessPulseCount = 1;
  azimuthSearchStart = 1;
  azimuthSearchEnd = 1;
  elevationSearchStart = 1;
  elevationSearchEnd = 1;
  azimuthSearchStepLength = 0;
  elevationSearchStepLength = 0;
  countEstimatedThreshold = 0;
  attackCriterionSelect = 1;
  pulseMatchTolerance = 0;
  priMatchTolerance = 0;
  extControl = 0;

  workTypeSelect = [{ code: 0, name: '实时校正模式' }, { code: 1, name: '自检模式' }, { code: 2, name: '搜索模式' }, { code: 3, name: '跟踪模式' }];
  broadbandSelect = [{ code: 0, name: '40M' }, { code: 1, name: '400M' }];
  attenuationCode1Select = [{ code: 0, name: '不衰减' }, { code: 1, name: '衰减20dB' }];
  frontWorkModelSelect = [{ code: 0, name: '直通' }, { code: 1, name: '放大' }];
  attackCriterionSelectSelect = [{ code: 0, name: '脉宽最大作为攻击对象' }, { code: 1, name: '重频最高作为攻击对象' }];

  constructor(
    private _udpService: UdpService,
    private _cd: ChangeDetectorRef,
    private _settingService: SettingService) { }

  ngOnInit() {
    this.loadConfig();
    this.subscription = this._udpService.getMessage().subscribe((msg: IntermediateFrequencyDataPack) => {
      if (msg.type === 4) {// 判断是中频数据
        if (msg.serial === this.serial) {
          this.data = Buffer.concat([this.data, msg.data]);

          // 协议说分2次发，所以只要拼接一次就算结束了,满了自动导出成csv
          this.exportData(this.data);
          this.data = Buffer.alloc(0);
          this.serial = -1;
        } else { // 首波中频
          this.data = msg.data;
          this.serial = msg.serial;
        }

        this._cd.detectChanges(); // 检测更改，更新UI。
      }
    });
  }


  sendRequest() {
    console.log('timeVal=', this.timeVal);
    this.serial++;
    if (this.serial >= 65535) {
      this.serial = 0;
    }
    const pack = new IntermediateFrequencyControlPack(this.serial);
    pack.intermediateFrequencyCollectTime = this.timeVal;
    pack.workType = this.workType;
    pack.broadband = this.broadband;
    pack.workPeriod = this.workPeriod;
    pack.workPeriodCount = this.serial; // 这个暂时和serial一样
    pack.workPeriodLength = this.workPeriodLength;
    pack.attenuationCode1 = this.attenuationCode1;
    pack.attenuationCode2 = this.attenuationCode2;
    pack.frontWorkModel = this.frontWorkModel;
    pack.workCenterFreq = this.workCenterFreq;
    pack.singlePoleFiveRolls = this.singlePoleFiveRolls;
    pack.excludePulseThreshold = this.excludePulseThreshold;
    pack.sideProcessPulseCount = this.sideProcessPulseCount;
    pack.azimuthSearchStart = this.azimuthSearchStart;
    pack.azimuthSearchEnd = this.azimuthSearchEnd;
    pack.elevationSearchStart = this.elevationSearchStart;
    pack.elevationSearchEnd = this.elevationSearchEnd;
    pack.azimuthSearchStepLength = this.azimuthSearchStepLength;
    pack.elevationSearchStepLength = this.elevationSearchStepLength;
    pack.countEstimatedThreshold = this.countEstimatedThreshold;
    pack.attackCriterionSelect = this.attackCriterionSelect;
    pack.pulseMatchTolerance = this.pulseMatchTolerance;
    pack.priMatchTolerance = this.priMatchTolerance;
    pack.extControl = this.extControl;
    this._udpService.sendIntFreqRequest(pack);
  }

  writeFile(fileName: string, content: any) {
    this.fs.writeFile(fileName, content, (err) => {
      if (err) {
        alert('An error ocurred creating the file ' + err.message);
      }

      alert('The file has been succesfully saved');
    });
  }

  /**
   * 一个通道有两组数据，分别由高位和低位表示。
   * @param data
   * @returns {string}
   */
  data2csv(data: Buffer): string {
    let csv = '';
    for (let i = 0; i < data.length; i++) {
      csv = csv + data.readInt16LE(i * 2); // 有符号的，所以是Int，否则是readUInt16LE
      if (i % 2 === 0) { // 如果是第一个数据，就后面加逗号，否则换行(0x0A)
        csv += ',';
      } else {
        csv += '\n'; // 最后一行可能会是一个空行，应该也不要紧，如果要紧就判断是最后两个字节后去掉
      }
    }
    return csv;
  }

  exportData(data: Buffer) {
    console.log('export data');
    const content = this.data2csv(data);
    const defaultFileName = new Date().toISOString().slice(0, 19).replace(/-/g, '').replace('T', '').replace(/:/g, '');
    if (this.folderPath) {// 选定了默认位置，直接存储
      this.writeFile(this.folderPath + '\\' + defaultFileName, content);
    } else { // 否则选择存储位置
      // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
      this.dialog.showErrorBox('路径错误', '请先选择保存位置');
    }
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
        this._cd.detectChanges(); // 检测更改，更新UI。
      }
    });
  }

  saveConfig() { // 保存中频配置到数据库
    this.intf = new Date().toISOString(); // TODO 修改成json字符串
    this._settingService
      .setIntf(this.intf)
      .updateSettingToDB();
    console.log('保存完成');
  }

  loadConfig() { // 读取中频配置
    this._settingService.fetchSettingFromDB().then(() => {
      this.intf = this._settingService.intf;
      console.log(this.intf);
      this._cd.detectChanges(); // 检测更改，更新UI。
    });
  }



}
