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
    console.log(this.models);
    this.models.tag.findAll()
      .then(function (tags) {
        console.log(tags);
        // console.log(tags[0].name);
      })
      .catch(function (error) {
        console.log('error:', error);
      });
  }

  getAll(table: string) {
    this.models[table].findAll()
      .then(function (data) {
        console.log(data.length);
        console.log(data[0].raw);
      })
      .catch(function (error) {
        console.log('error:', error);
      });
  }

  create(table: string, raw: any) {
    this.models[table].create({
      raw: raw
    });
  }
}
