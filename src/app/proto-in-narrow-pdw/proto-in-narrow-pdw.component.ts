import {ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {JsonEditorComponent, JsonEditorOptions} from 'angular4-jsoneditor/jsoneditor/jsoneditor.component';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';

@Component({
  selector: 'app-proto-in-narrow-pdw',
  templateUrl: './proto-in-narrow-pdw.component.html',
  styleUrls: ['./proto-in-narrow-pdw.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class ProtoInNarrowPdwComponent implements OnInit {

  public editorOptions: JsonEditorOptions;
  public data: any;
  @ViewChild(JsonEditorComponent) editor: JsonEditorComponent;

  constructor(private snackBar: MdSnackBar) {
    this.editorOptions = new JsonEditorOptions();
    // this.editorOptions.modes = ['code', 'text', 'tree', 'view']; // set all allowed modes
    this.editorOptions.modes = ['code', 'tree', 'view']; // set all allowed modes
    this.editorOptions.mode = 'code'; // set only one mode
    // const that = this;
    this.editorOptions.onChange = function () {
      console.log(`onChange:`);
    }

    this.data = [
      {'name': '脉间类型', 'bytes': 1, 'type': 'number', 'enum': '0:固定,1:脉间捷变,2:脉组捷变,3:分时分集'}, {
        'name': '到达时间',
        'bytes': 2,
        'type': 'number',
        'multiple': 8,
        'unit': 'ns'
      }, {'name': 'XX个数', 'bytes': 2, 'type': 'number', 'multiple': 1, 'unit': ''}, {
        'name': '分机工作温度',
        'bytes': 2,
        'type': 'number',
        'multiple': 0.0078125,
        'unit': '℃'
      }, {'name': '脉内有效标志', 'bytes': 1, 'type': 'flag', 'yes': '有效', 'no': '无效'}, {
        'name': '备份码',
        'bytes': 10,
        'type': 'string'
      }];
  }

  ngOnInit() {
  }

  save() {
    const config = new MdSnackBarConfig();
    config.duration = 5000;
    try {
      const dataValue = JSON.stringify(this.editor.get());
      console.log(dataValue);
      this.snackBar.open('保存成功', null, config);
    } catch (e) {
      this.snackBar.open('格式错误，请检查', null, config);
    }
  }

  initSetting() {
  }

}
