import { SettingService } from './../setting.service';
import { IntermediateFrequencyControlPack, IntermediateFrequencyDataPack } from './../protocol/data-pack';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { UdpService } from 'app/udp.service';
import { Buffer } from 'buffer';
import { DatePipe } from '@angular/common';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';

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
  dialog = electron.remote.dialog;
  fs = electron.remote.getGlobal('fs');
  subscription: Subscription;
  intf; // 参数

  data: Buffer; // 中频的数据
  serial: number = -1;

  workTypeSelect = [{ code: 0, name: '实时校正模式' }, { code: 1, name: '自检模式' }, { code: 2, name: '搜索模式' }, { code: 3, name: '跟踪模式' }];
  broadbandSelect = [{ code: 0, name: '40M' }, { code: 1, name: '400M' }];
  attenuationCode1Select = [{ code: 0, name: '不衰减' }, { code: 1, name: '衰减20dB' }];
  frontWorkModelSelect = [{ code: 0, name: '直通' }, { code: 1, name: '放大' }];
  attackCriterionSelectSelect = [{ code: 0, name: '脉宽最大作为攻击对象' }, { code: 1, name: '重频最高作为攻击对象' }];

  constructor(
    private _udpService: UdpService,
    private _cd: ChangeDetectorRef,
    private datePipe: DatePipe,
    private snackBar: MdSnackBar,
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
    console.log(`intermediateFrequencyCollectTime: ${this.intf.collectTime}`);
    this.serial++;
    if (this.serial >= 65535) {
      this.serial = 0;
    }
    const pack = new IntermediateFrequencyControlPack(this.serial);
    pack.intermediateFrequencyCollectTime = this.intf.collectTime;
    pack.workType = this.intf.workType;
    pack.broadband = this.intf.broadband;
    pack.workPeriod = this.intf.workPeriod;
    pack.workPeriodCount = this.serial; // 这个暂时和serial一样
    pack.workPeriodLength = this.intf.workPeriodLength;
    pack.attenuationCode1 = this.intf.attenuationCode1;
    pack.attenuationCode2 = this.intf.attenuationCode2;
    pack.frontWorkModel = this.intf.frontWorkModel;
    pack.workCenterFreq = this.intf.workCenterFreq;
    pack.singlePoleFiveRolls = this.intf.singlePoleFiveRolls;
    pack.excludePulseThreshold = this.intf.excludePulseThreshold;
    pack.sideProcessPulseCount = this.intf.sideProcessPulseCount;
    pack.azimuthSearchStart = this.intf.azimuthSearchStart;
    pack.azimuthSearchEnd = this.intf.azimuthSearchEnd;
    pack.elevationSearchStart = this.intf.elevationSearchStart;
    pack.elevationSearchEnd = this.intf.elevationSearchEnd;
    pack.azimuthSearchStepLength = this.intf.azimuthSearchStepLength;
    pack.elevationSearchStepLength = this.intf.elevationSearchStepLength;
    pack.countEstimatedThreshold = this.intf.countEstimatedThreshold;
    pack.attackCriterionSelect = this.intf.attackCriterionSelect;
    pack.pulseMatchTolerance = this.intf.pulseMatchTolerance;
    pack.priMatchTolerance = this.intf.priMatchTolerance;
    pack.extControl = this.intf.extControl;
    this._udpService.sendIntFreqRequest(pack);
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
    // console.log('export data');
    const content = this.data2csv(data);
    const now = new Date();
    const defaultFileName = this.datePipe.transform(now, 'yyyyMMdd_HHmmss') + '_' + now.getMilliseconds() + '.csv';
    if (this.intf.folderPath) {// 选定了默认位置，直接存储
      this.writeFile(this.intf.folderPath + '\\' + defaultFileName, content);
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
        this.intf.folderPath = folderPaths[0];
        this.saveConfig();
        this._cd.detectChanges(); // 检测更改，更新UI。
      }
    });
  }

  saveConfig() { // 保存中频配置到数据库
    this._settingService.setIntf(JSON.stringify(this.intf)).updateSettingToDB();
    // console.log('保存完成');
  }

  loadConfig() { // 读取中频配置
    const defaultIntfConfig = {workType: 2, broadband: 0, workPeriod: 0, workPeriodLength: 50, attenuationCode1: 1,
      attenuationCode2: 0, frontWorkModel: 1, singlePoleFiveRolls: 0, excludePulseThreshold: 0, sideProcessPulseCount: 1,
      workCenterFreq: 2, collectTime: 1, // 中频采集时间
      azimuthSearchStart: 1, azimuthSearchEnd: 1, elevationSearchStart: 1, elevationSearchEnd: 1, azimuthSearchStepLength: 0,
      elevationSearchStepLength: 0, countEstimatedThreshold: 0, attackCriterionSelect: 1, pulseMatchTolerance: 0,
      priMatchTolerance: 0, extControl: 0, folderPath: 'C:'
    };
    this.intf = defaultIntfConfig;
    this._settingService.fetchSettingFromDB().then(() => {
      try {
        this.intf = JSON.parse(this._settingService.intf);
      } catch (e) {
        console.error(`error parser intf params, ${e}`);
        this.intf = defaultIntfConfig;
      }
      if (!this.intf.folderPath) { // 默认保存路径
        this.intf.folderPath = 'C:';
      }
      console.log(`intf params: ${JSON.stringify(this.intf)}`);
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
