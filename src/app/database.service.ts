import { Injectable } from '@angular/core';

declare var electron: any; // 　Typescript 定义

@Injectable()
export class DatabaseService {
  remote = electron.remote;
  models = this.remote.getGlobal('models');

  constructor() {
    console.log('database service constructor');
  }

  authenticate() {
    this.models.sequelize
      .authenticate()
      .then(function () {
        console.log('Connection successful');
      })
      .catch(function (error) {
        console.log('Error creating connection:', error);
      });
  }

  index() {
    this.models.Author.findAll()
      .then(function (authors) {
        // console.log(authors);
        console.log(authors[0].name);
      })
      .catch(function (error) {
        console.log('error');
      })
  }
}
