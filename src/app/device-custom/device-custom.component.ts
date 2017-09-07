import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {TcpService} from 'app/tcp.service';
import {Subscription} from 'rxjs/Subscription';
import {BaseDataPack} from 'app/protocol/data-pack';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {DatePipe} from '@angular/common';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-device-pdw',
  templateUrl: './device-custom.component.html',
  styleUrls: ['./device-custom.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DeviceCustomComponent implements OnInit, OnDestroy {
  // message: any;
  private sub: any;
  subscription: Subscription;
  items = [];
  tabs = [];
  columns = [];
  currentIndex = 0;
  columnsPerTab = 10;
  start = 0;
  len = 1;
  dataPack: BaseDataPack;

  control: string;
  gps: string;
  host: string;
  protoId: number;
  time: string;
  custom: number;

  constructor(private route: ActivatedRoute,
              private tcpService: TcpService,
              private cd: ChangeDetectorRef,
              private datePipe: DatePipe,
              private snackBar: MdSnackBar) {
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.custom = params['custom'];
      // console.log(`this.custom: ${this.custom}`);
    });
    this.subscription = this.tcpService.getMessage().subscribe((msg: BaseDataPack) => {
      if (msg.type  === this.custom) {
        this.dataPack = msg;
        this.host = msg.host;
        this.gps = [msg.gps.slice(0, 64), msg.gps.slice(64)].join('\n');
        this.control = [msg.control.slice(0, 64), msg.control.slice(64)].join('\n');
        this.time = this.datePipe.transform(msg.time, 'yyyy-MM-dd HH:mm:ss.') + msg.time.toString().substring(10, 13);
        if (this.protoId !== msg.protoId) {
          this.tabs = this.generateTabs();
          this.columns = this.generateColumns();
          this.protoId = msg.protoId;
        }
        this.items = this.dataPack.parseDataItems(this.start, this.len);
        this.cd.detectChanges(); // 检测更改，更新UI。
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
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
