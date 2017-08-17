import {MySettings} from './settings/my-settings';
import {DatabaseService} from './database.service';
import {Injectable} from '@angular/core';

@Injectable()
export class SettingService {

  local_port: number;
  remote_port: number;
  local_host: string;
  remote_host: string;
  debug: boolean;
  record: boolean;
  intf: string;
  other: string;
  otherSt: JSON;

  constructor(private _dbService: DatabaseService) {
    // console.log('setting service constructor');
    this.fetchSettingFromDB().then(() => {
      console.log('数据库读取完成');
    });
  }

  fetchSettingFromDB() { // 从数据库读取
    return new Promise((resolve) => {
      this._dbService.models.setting.findOne({
        where: {
          id: 1
        }
      }).then((data) => {
        // console.log(`data= ${data}`);
        if (data) {
          this.parseData(data);
          resolve();
        } else {
          this.initSetting().then(() => {
            this.parseData(data);
            resolve();
          });
        }
      });
    });

  }

  parseData(data) {
    const st: MySettings = data;
    this.remote_host = st.remote_host;
    this.remote_port = st.remote_port;
    this.local_port = st.local_port;
    this.local_host = st.local_host;
    this.debug = st.debug;
    this.record = st.record;
    this.intf = st.intf;
    this.other = st.other;
    if (!st.other) {
      st.other = '{}';
    }
    const otherSt = JSON.parse(st.other);
    if (!otherSt.remoteHost) {
      otherSt.remoteHost = '192.168.0.1';
    }
    if (!otherSt.hosts) {
      otherSt.hosts = ['127.0.0.1'];
    }
    this.otherSt = otherSt;
  }

  updateSettingHostIfNotExists(host: string) {
    const hosts = this.otherSt['hosts'];
    if (hosts.indexOf(host) < 0) {
      hosts.push(host);
      this.updateOtherSettingToDB(hosts, null);
      console.warn(`settings hosts not contains: ${host}, append it to settings`);
    }
  }

  updateOtherSettingToDB(hosts: Array<string>, selectedHost: string) {
    if (hosts != null) {
      this.otherSt['hosts'] = hosts;
    }
    if (selectedHost != null) {
      this.otherSt['remoteHost'] = selectedHost;
    }
    this.other = JSON.stringify(this.otherSt);
    // console.log(`other: ${this.other}`);
    this.updateSettingToDB();
  }

  updateSettingToDB() { // 更新数据库
    const newData = {
      local_port: this.local_port,
      remote_port: this.remote_port,
      local_host: this.local_host,
      remote_host: this.remote_host,
      intf: this.intf,
      debug: this.debug,
      record: this.record,
      other: this.other
    };
    // console.log('newData=', newData);
    this._dbService.models.setting
      .update(
        newData,
        {where: {id: 1}}
      );
  }

  toggleDebug() {
    this.debug = !this.debug;
    console.log('debug=', this.debug);
    this.updateSettingToDB();
  }

  toggleRecord() {
    this.record = !this.record;
    console.log('record=', this.record);
    this.updateSettingToDB();
  }

  initSetting() { // 初始化数据库
    return new Promise((resolve) => {
      this._dbService.models.setting.destroy({
        where: {},
        truncate: true
      }).then(() => {
        // console.log('设置已销毁');
        this._dbService.models.setting.create({
          id: 1,
          local_port: 8512,
          local_host: '0.0.0.0',
          remote_host: '192.168.0.1',
          remote_port: '6011',
          debug: false,
          record: false,
          intf: '',
          other: '{}'
        });
        console.log('设置初始化完成');
        resolve();
      });
    });
  }

  setLocalAddress(host: string, port: number) {
    this.local_host = host;
    this.local_port = port;
    console.log(`setLocalAddress to ${this.local_host}:${this.local_port}`);
    return this; // 方便chain
  }

  setRemoteAddress(host: string, port: number) {
    this.remote_host = host;
    this.remote_port = port;
    console.log(`setRemoteAddress to ${this.remote_host}:${this.remote_port}`);
    return this; // 方便chain
  }

  setIntf(data: string) {
    this.intf = data;
    console.log(`set intf to ${this.intf}`);
    return this; // 方便chain
  }

}
