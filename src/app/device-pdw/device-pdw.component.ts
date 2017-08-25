import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TcpService } from 'app/tcp.service';
import { Subscription } from 'rxjs/Subscription';
import { NarrowBandFullPulseDataPack } from 'app/protocol/data-pack';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';

@Component({
  selector: 'app-device-pdw',
  templateUrl: './device-pdw.component.html',
  styleUrls: ['./device-pdw.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DevicePdwComponent implements OnInit, OnDestroy {
  // message: any;
  subscription: Subscription;
  items = [];
  tabs = [];
  columns = [];
  currentIndex = 0;
  columnsPerTab = 10;
  start = 0;
  len = 1;
  dataPack: NarrowBandFullPulseDataPack;

  control: string;
  gps: string;
  host: string;
  protoId: number;

  constructor(private tcpService: TcpService, private cd: ChangeDetectorRef, private snackBar: MdSnackBar) { }
  ngOnInit() {
    this.subscription = this.tcpService.getMessage().subscribe((msg: NarrowBandFullPulseDataPack) => {
      if (msg.type === 1) {// 判断是窄带全脉冲
        this.dataPack = msg;
        this.host = msg.host;
        this.protoId = msg.protoId;
        this.gps = [msg.gps.slice(0, 64), msg.gps.slice(64)].join('\n');
        this.control = [msg.control.slice(0, 64), msg.control.slice(64)].join('\n');
        this.tabs = this.generateTabs();
        this.columns = this.generateColumns();
        this.items = this.dataPack.parseDataItems(this.start, this.len);
        this.cd.detectChanges(); // 检测更改，更新UI。
      }
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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

  showToast(message: string) {
    const config = new MdSnackBarConfig();
    config.duration = 5000;
    this.snackBar.open(message, null, config);
  }

  generateTabs() {
    const items = [];
    const page = ~~((this.dataPack.datas.length - 1) / this.columnsPerTab + 1);
    // console.log(`datas length: ${this.dataPack.datas.length}, page: ${page}`);
    for (let i = 0; i < page; i++) {
      const obj = {};
      let end = i * this.columnsPerTab + this.columnsPerTab;
      if (end > this.dataPack.datas.length) {
        end = this.dataPack.datas.length;
      }
      obj['name'] = (i * this.columnsPerTab + 1) + '-' + end;
      obj['value'] = i;
      items.push(obj);
    }
    return items;
  }

  generateColumns() {
    const start = this.currentIndex * this.columnsPerTab;
    let len = this.columnsPerTab;
    if (start + len > this.dataPack.datas.length - 1) {
      len = this.dataPack.datas.length - start;
    }
    this.start = start;
    this.len = len;
    const items = [];
    for (let i = start; i < start + len; i++) {
      const obj = {};
      obj['name'] = i;
      obj['value'] = i;
      items.push(obj);
    }
    return items;
  }

  tabSelected(event) {
    this.currentIndex = event.index;
    this.columns = this.generateColumns();
    this.items = this.dataPack.parseDataItems(this.start, this.len);
  }

}
