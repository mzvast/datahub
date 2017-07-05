import { IntermediateFrequencyDataPack } from './../protocol/data-pack';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { UdpService } from 'app/udp.service';

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
  timeInt = 1;
  timeMax = 25;
  timeMin = 0.1;
  subscription: Subscription;
  message = '未收到数据';
  serial: number;

  // 参数
  workType = 2;
  broadband = 1;
  workPeriod = 0;
  workPeriodLength = 50;


  workTypeSelect = [{code: 0, name: '实时校正模式'}, {code: 1, name: '自检模式'}, {code: 2, name: '搜索模式'}, {code: 3, name: '跟踪模式'}];
  broadbandSelect = [{code: 0, name: '40M'}, {code: 1, name: '400M'}];

  constructor(private udpService: UdpService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.subscription = this.udpService.getMessage().subscribe((msg: IntermediateFrequencyDataPack) => {
      if (msg.type === 4) {// 判断是中频数据
        if (this.serial === undefined) { // 首波中频，无序号
          this.serial = msg.serial;
        } else if (msg.serial === this.serial) { // 中频序号相同，为同一幅图
          this.message += msg.data.slice(-8); // TODO 拼接数据
        } else {
          // TODO 怎样判断结束？
        }
        this.cd.detectChanges(); // 检测更改，更新UI。
      }
    });
  }

  timePlus(val: number) {
    if (this.timeInt + val <= this.timeMax) {
      this.timeInt += val;
    }
  }

  timeMinus(val: number) {
    if (this.timeInt - val >= this.timeMin) {
      this.timeInt -= val;
    }
  }

  timeSet(val: number) {
    this.timeInt = val;
  }

  sendRequest() {
    console.log('timeInt=', this.timeInt);
    this.udpService.sendIntFreqRequest(this.timeInt);
  }

  writeFile(fileName: string, content: any) {
    this.fs.writeFile(fileName, content, (err) => {
      if (err) {
        alert('An error ocurred creating the file ' + err.message)
      }

      alert('The file has been succesfully saved');
    });
  }

  exportData() {
    console.log('export data');
    const content = 'Some text to save into the file'; // TODO 传入最终csv数据
    const defaultFileName = new Date().toISOString().slice(0, 19).replace(/-/g, '').replace('T', '').replace(/:/g, '');
    if (this.folderPath) {// 选定了默认位置，直接存储
      this.writeFile(this.folderPath + '\\' + defaultFileName, content);
    } else { // 否则选择存储位置
      // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
      this.dialog.showErrorBox('路径错误', '请先选择保存位置')
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
        this.cd.detectChanges(); // 检测更改，更新UI。
      }
    });
  }



}
