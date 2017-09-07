import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  ViewEncapsulation
} from '@angular/core';
import {MD_DIALOG_DATA, MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {ProtocolPack} from '../protocol/protocol-pack';
import {Buffer} from 'buffer';
import {BaseDataPack} from './../protocol/data-pack';

@Component({
  selector: 'app-data-show-dialog',
  templateUrl: './data-show-dialog.component.html',
  styleUrls: ['./data-show-dialog.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})

export class DataShowDialogComponent implements OnInit, OnDestroy {

  items = []; // TODO 这里还不对，要根据每一列要获取要的数据
  tabs = [];
  columns = [];
  dataPack: BaseDataPack;
  raw: string;
  currentIndex = 0;
  columnsPerTab = 10;
  start = 0;
  len = 1;
  time: string;

  constructor(@Optional() @Inject(MD_DIALOG_DATA) public data: any, private snackBar: MdSnackBar) {
    // console.log(data);
    if (data.type === 'pkg') {
      this.raw = data.raw;
    } else {
      this.parserRaw(data.time, data.remote_host, data.raw, data.protoId, data.proto);
    }

  }

  parserRaw(time: string, host: string, raw: string, protoId: number, proto: JSON) {
    // 数据库里前面的东西没有存，没用，只存了data，所以放一些0
    const protocolPack = new ProtocolPack(host, 0, 0, 0, 0, 0, 1, Buffer.from(raw, 'hex'));
    this.dataPack = protocolPack.parserDataPack(false); // 解析包数据
    this.dataPack.proto = proto;
    this.dataPack.protoId = protoId;
    this.currentIndex = 0;
    this.time = time;
    console.log(`data pack parser ok, type: ${this.dataPack.type}, protoId: ${protoId}`);
    if (this.dataPack) {
      const gps = this.dataPack.gps;
      this.dataPack.gps = [gps.slice(0, 64), gps.slice(64)].join('\n');
      const control = this.dataPack.control;
      this.dataPack.control = [control.slice(0, 64), control.slice(64)].join('\n');

      this.tabs = this.generateTabs();
      this.columns = this.generateColumns();
      this.items = this.dataPack.parseDataItems(this.start, this.len);
    }

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

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.items = [];
    this.dataPack = null;
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

  tabSelected(event) {
    this.currentIndex = event.index;
    this.columns = this.generateColumns();
    this.items = this.dataPack.parseDataItems(this.start, this.len);
  }
}
