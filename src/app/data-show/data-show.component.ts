import {DataShowDialogComponent} from './../data-show-dialog/data-show-dialog.component';
import {DatabaseService} from './../database.service';
import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MdDialog} from '@angular/material';
import {DatePipe} from '@angular/common';
import {SettingService} from '../setting.service';
import {Page} from '../globals.service';


@Component({
  selector: 'app-data-show',
  templateUrl: './data-show.component.html',
  styleUrls: ['./data-show.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DataShowComponent implements OnInit, OnDestroy {
  hosts: Array<string>;
  selectedHost;
  model: string;
  custom = -1;
  private sub: any;
  rows = [];
  selected = [];
  columns: any[] = [
    {name: 'ID', prop: 'id'},
    {name: '接收时间', prop: 'time'},
    {name: '协议号', prop: 'proto_id'},
    // {name: '数据', prop: 'raw'}
  ];
  page = new Page();

  constructor(private route: ActivatedRoute,
              private _databaseService: DatabaseService,
              private _settingService: SettingService,
              private datePipe: DatePipe,
              private dialog: MdDialog) {
    this.page.pageNumber = 0;
    this.page.size = 10;
  }

  parseSetting() {
    this.selectedHost = this._settingService.otherSt['remoteHost'];
    this.hosts = this._settingService.otherSt['hosts'];
    // this._cd.detectChanges(); // 检测更改，更新UI。
  }

  updateSelectedHost() {
    this.fetch({offset: 0});
    this._settingService.updateOtherSettingToDB(null, this.selectedHost, 0);
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      const type = params['type'];
      if (type.startsWith('custom')) {
        this.model = 'custom';
        const tp = type.substring(6, type.length);
        this.custom = parseInt(tp, 10);
      } else {
        this.model = type;
        this.custom = -1;
      }
      this._databaseService.authenticate();
      this._settingService.fetchSettingFromDB().then(() => {
        this.parseSetting();
        this.fetch({offset: 0});
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  openDialog() {
    this.dialog.open(DataShowDialogComponent);
  }

  fetch(pageInfo) {
    this.page.pageNumber = pageInfo.offset;
    let where;
    if (this.custom > 0) {
      where = {
        remote_host: this.selectedHost,
        type: this.custom
      };
    } else {
      where = {
        remote_host: this.selectedHost
      };
    }
    this._databaseService.models[this.model].findAndCountAll({
      where: where,
      // where: ['remote_host = "::ffff:127.0.0.1"'],
      order: 'createdAt desc',
      offset: this.page.pageNumber * this.page.size,
      limit: this.page.size
    }).then((result) => {
      // console.log(`${result.rows.length} rows fetched`);
      // console.log(`${result.count} total rows`);
      this.page.totalElements = result.count;
      // console.log(data[0].raw.toString());
      // console.log(data[0].createdAt);
      this.rows = result.rows.map((curVal, index, arr) => {
        // console.log(`data length: ${data.length}, curVal: ${curVal}`);
        return {
          id: curVal.id,
          time: this.datePipe.transform(curVal.createdAt, 'yyyy-MM-dd HH:mm:ss.') + curVal.createdAt.getTime().toString().substring(10, 13),
          remote_host: curVal.remote_host,
          proto_id: curVal.proto_id,
          raw: curVal.raw.toString()
        };
      });
      // console.log(this.data);
    }).catch((error) => {
      console.log('error:', error);
    });
  }

  onSelect({selected}) {
    if (this.model === 'pkg') {
      this.dialog.open(DataShowDialogComponent, {
        data: {
          raw: this.selected[0]['raw'],
          remote_host: this.selected[0]['remote_host'],
          type: this.model
        }
      });
    } else {
      const protoId = this.selected[0]['proto_id'];
      this._databaseService.models['proto'].findById(protoId).then((result) => {
        if (this._settingService.debug) {
          console.log(`proto: ${protoId}`, result.raw.toString());
        }
        this.dialog.open(DataShowDialogComponent, {
          data: {
            raw: this.selected[0]['raw'],
            remote_host: this.selected[0]['remote_host'],
            time: this.selected[0]['time'],
            type: this.model,
            protoId: result.id,
            proto: JSON.parse(result.raw.toString()),
            custom: this.custom
          }
        });
      }).catch((error) => {
        console.log('error:', error);
      });
    }

    // console.log('Select Event', selected, this.selected);
  }

  onActivate(event) {
    // console.log('Activate Event', event);
  }

  updateRowPosition() {
    const ix = this.getSelectedIx();
    const arr = [...this.rows];
    arr[ix - 1] = this.rows[ix];
    arr[ix] = this.rows[ix - 1];
    this.rows = arr;
  }

  getSelectedIx() {
    return this.selected[0]['$$index'];
  }

  clearHistory() {
    console.log(`Clear History, model: ${this.model}, custom: ${this.custom}`);
    this._databaseService.destroyTable(this.model, this.custom);
    this.fetch({offset: 0});
  }
}
