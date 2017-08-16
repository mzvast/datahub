import {ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {JsonEditorComponent, JsonEditorOptions} from 'angular4-jsoneditor/jsoneditor/jsoneditor.component';
import { MdSnackBar, MdSnackBarConfig} from '@angular/material';

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

  constructor(
    private snackBar: MdSnackBar) {
    this.editorOptions = new JsonEditorOptions();
    // this.editorOptions.modes = ['code', 'text', 'tree', 'view']; // set all allowed modes
    this.editorOptions.modes = ['code', 'tree', 'view']; // set all allowed modes
    this.editorOptions.mode = 'code'; // set only one mode
    // const that = this;
    // this.editorOptions.onChange = function () {
    //   that.editorOptions.max
    // }

    this.data = {
      'products': '111'
    };
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
