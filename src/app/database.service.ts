import { Injectable } from '@angular/core';

declare var electron: any; // 　Typescript 定义

@Injectable()
export class DatabaseService {

  ipcRenderer = electron.ipcRenderer;
  remote = electron.remote;

  constructor() {
    console.log('hello');
    // electron调用例子
    // this.ipcRenderer.send('hello');
    // this.remote.dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']});
  }
  getData() {
    return '0v0';
  }
}
