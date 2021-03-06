import { Injectable } from '@angular/core';

declare var electron: any; // 　Typescript 定义

@Injectable()
export class DatabaseService {
  remote = electron.remote;
  models = this.remote.getGlobal('models');

  constructor() {
    // console.log('database service constructor');
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
        console.log(data);
      })
      .catch(function (error) {
        console.log('error:', error);
      });
  }

  create(table: string, proto_id: number, host: string, raw: any) {
    this.models[table].create({
      proto_id: proto_id,
      remote_host: host,
      raw: raw
    });
  }

  createRaw(table: string, host: string, raw: any) {
    this.models[table].create({
      remote_host: host,
      raw: raw
    });
  }

  destroyTable(table: string, custom: number) {
    let where;
    if (custom > 0) {
      where = {
        type: custom
      };
    } else {
      where = {};
    }
    this.models[table].destroy({
      where: where,
      truncate: true
    });
  }
}
