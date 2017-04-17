import { Injectable } from '@angular/core';

declare var electron: any; // 　Typescript 定义

@Injectable()
export class DatabaseService {

  ipcRenderer = electron.ipcRenderer;
  remote = electron.remote;

  constructor() {
    console.log('database service constructor');
    this.remote.ipcMain.on('asynchronous-message', (event, arg) => {
      console.log(arg);
      event.sender.send('asynchronous-reply', 'pong');
    });
    this.ipcRenderer.on('asynchronous-reply', (event, arg) => {
      console.log(arg); // prints "pong"
    });
    // electron调用例子
    // this.ipcRenderer.send('hello');
    // this.remote.dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']});
  }
  getData() {
    this.ipcRenderer.send('asynchronous-message', 'ping');
    return '0v0';
  }
}
