import { Injectable } from '@angular/core';

declare var electron: any; // 　Typescript 定义

@Injectable()
export class DatabaseService {

  ipcRenderer = electron.ipcRenderer;
  remote = electron.remote;
  ipcMain = this.remote.ipcMain;
  models = this.remote.getGlobal('models');

  constructor() {
    console.log('database service constructor');
    this.ipcMain.on('asynchronous-message', (event, arg) => {
      console.log(arg);
      event.sender.send('asynchronous-reply', 'pong');
    });
    this.ipcRenderer.on('asynchronous-reply', (event, arg) => {
      console.log(arg); // prints "pong"
    });
    this.models.sequelize
      .authenticate()
      .then(function () {
        console.log('Connection successful');
      })
      .catch(function (error) {
        console.log("Error creating connection:", error);
      });
  }
  getData() {
    this.ipcRenderer.send('asynchronous-message', 'ping');
    return '0v0';
  }
  index() {
    this.models.Author.findAll()
    .then(function(authors){
      // console.log(authors);
      console.log(authors[0].name);
      return authors[0].name;
    })
    .catch(function(error){
      console.log('error');
    })
  }
}
