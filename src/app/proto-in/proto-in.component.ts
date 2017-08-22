import {ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {DatabaseService} from './../database.service';
import * as myGlobals from '../globals.service';
import {Page} from '../globals.service';
import {JsonEditorComponent, JsonEditorOptions} from 'angular4-jsoneditor/jsoneditor/jsoneditor.component';
import {DatePipe} from '@angular/common';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';

@Component({
  selector: 'app-proto-in',
  templateUrl: './proto-in.component.html',
  styleUrls: ['./proto-in.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ProtoInComponent implements OnInit {

  public editorOptions: JsonEditorOptions;
  @ViewChild(JsonEditorComponent) editor: JsonEditorComponent;

  protos = [{code: 0, name: '标签包'}, {code: 1, name: '全脉冲'}, {code: 5, name: '辐射源'}, {code: -4, name: '中频控制'}];
  selectedProto: number;
  status: string;

  rows = [];
  selected = [];
  currentData;
  page = new Page();

  constructor(private _databaseService: DatabaseService,
              private datePipe: DatePipe,
              private snackBar: MdSnackBar) {
    this.page.pageNumber = 0;
    this.page.size = 5;

    this.editorOptions = new JsonEditorOptions();
    // this.editorOptions.modes = ['code', 'text', 'tree', 'view']; // set all allowed modes
    // this.editorOptions.modes = ['code'];
    this.editorOptions.mode = 'code'; // set only one mode
    const that = this;
    this.editorOptions.onChange = function () {
      try {
        const json = that.editor.get();
        const validateResult = myGlobals.validateProtocol(json);
        if (!validateResult.result) {
          that.updateStatus(validateResult.message, false);
        } else {
          that.updateStatus('协议解析成功，总字节数：' + validateResult.bytes, true);
        }
      } catch (e) {
        that.updateStatus('JSON解析错误', false);
      }
    };
  }

  ngOnInit() {
    this.selectedProto = 0;
    this._databaseService.authenticate();
    this.fetch({offset: 0});
  }

  updateSelectedProto() {
    // console.log(`selectedProto:${this.selectedProto}`);
    this.fetchAndSelect({offset: 0}, true);
  }

  fetchAndSelect(pageInfo, select: boolean) {
    this.page.pageNumber = pageInfo.offset;
    this._databaseService.models['proto'].findAndCountAll({
      where: {
        type: this.selectedProto
        // ,attr2: 'cake'
      },
      // where: ['remote_host = "::ffff:127.0.0.1"'],
      order: 'in_use desc, id desc',
      offset: this.page.pageNumber * this.page.size,
      limit: this.page.size
    }).then((result) => {
      this.page.totalElements = result.count;
      this.rows = result.rows.map((curVal, index, arr) => {
        return {
          id: curVal.id,
          type: curVal.type,
          in_use: curVal.in_use,
          time: this.datePipe.transform(curVal.createdAt, 'yyyy-MM-dd HH:mm:ss'),
          raw: curVal.raw.toString()
        };
      });
      // if (!this.selected || this.selected.length === 0) {
      if (this.rows.length > 0) {
        if (select || !this.currentData) {
          this.updateCurrentEditor(this.rows[0]);
        }

      }
      // }
      // console.log(this.data);
    }).catch((error) => {
      console.log('error:', error);
    });
  }

  fetch(pageInfo) {
    this.fetchAndSelect(pageInfo, false);
  }

  onSelect({selected}) {
    // console.log('Select Event', selected, this.selected);
    this.updateCurrentEditor(this.selected[0]);
  }

  onActivate(event) {
    // console.log('Activate Event', event);
  }

  setDefault() {
    if (!this.selected || this.selected.length === 0) {
      this.showToast('请先选择一条协议');
      return;
    }
    // console.log(this.selected[0]['id']);
    const selectedId = this.selected[0]['id'];
    const that = this;
    that._databaseService.models['proto'].update(
      {in_use: 0}, {where: {type: that.selectedProto}}
    ).then(function () {
      that._databaseService.models['proto'].update(
        {in_use: 1}, {where: {type: that.selectedProto, id: selectedId}}
      ).then(function () {
        that.showToast('成功设置');
        that.fetchAndSelect({offset: 0}, false);
      });
    });
  }

  saveNew() {
    this.doSave(0);
  }

  doSave(selectedId: number) {
    try {
      const json = this.editor.get();
      const validateResult = myGlobals.validateProtocol(json);
      if (!validateResult.result) {
        this.showToast(validateResult.message);
        return;
      }
      const dataValue = JSON.stringify(json);
      // console.log(`dataValue: ${dataValue}`)
      const that = this;
      if (selectedId > 0) {
        that._databaseService.models['proto'].update(
          {raw: dataValue}, {where: {id: selectedId}}
        ).then(function () {
          that.showToast('成功保存');
          that.fetchAndSelect({offset: 0}, false);
        });
      } else {
        that._databaseService.models['proto'].create({
          in_use: false,
          type: that.selectedProto,
          raw: dataValue
        }).then(function () {
          that.showToast('成功另存');
          that.fetchAndSelect({offset: 0}, true);
        });
      }

      // console.log(dataValue);
      this.showToast('保存成功，字节数: ' + validateResult.bytes);
    } catch (e) {
      this.showToast('JSON格式错误，请检查');
    }
  }

  save() {
    this.doSave(this.currentData['id']);
  }

  showToast(message: string) {
    const config = new MdSnackBarConfig();
    config.duration = 5000;
    this.snackBar.open(message, null, config);
  }

  updateCurrentEditor(data) {
    this.updateStatus('', false);
    this.currentData = data;
    try {
      const jsonValue = JSON.parse(data['raw']);
      this.editor.set(jsonValue);
      const validateResult = myGlobals.validateProtocol(jsonValue);
      if (!validateResult.result) {
        this.updateStatus(validateResult.message, false);
      } else {
        this.updateStatus(data['id'] + '号协议解析成功，总字节数：' + validateResult.bytes, true);
      }
    } catch (e) {
      this.editor.set(JSON.parse('{}'));
      this.updateStatus('JSON解析错误', false);
      console.error('parser json error', e);
    }
  }

  updateStatus(message: string, success: boolean) {
    if (!message) {
      this.status = '';
      return;
    }
    if (success) {
      this.status = '<font color=\"green\">' + message + '</font>';
    } else {
      this.status = '<font color=\"red\">' + message + '</font>';
    }
  }

}
