import { MySettings } from './settings/my-settings';
import { DatabaseService } from './database.service';
import { Injectable } from '@angular/core';

@Injectable()
export class SettingService {
  local_port: number;
  remote_port: number;
  local_host: string;
  remote_host: string;
  debug: boolean;
  record: boolean;

  constructor(private _dbService: DatabaseService) {
    this.fetchSettingFromDB();
  }

  fetchSettingFromDB() {
    this._dbService.models.setting.findOne({
      where: {
        id: 1
      }
    })
      .then((data) => {
        if (!data) {
          console.log(`data= ${data}`);
          this.initSetting();
          setTimeout(() => {
            this.fetchSettingFromDB();
          }, 100);
        } else {
          const st: MySettings = data;
          this.remote_host = st.remote_host;
          this.remote_port = st.remote_port;
          this.local_port = st.local_port;
          this.local_host = st.local_host;
          this.debug = st.debug;
          this.record = st.record;
        }
      });
  }

  updateSettingToDB() {
    const newData = {
      local_port: this.local_port,
      debug: this.debug,
      record: this.record
    };
    // console.log('newData=', newData);
    this._dbService.models.setting
      .update(
      newData,
      { where: { id: 1 } }
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

  initSetting() {
    this._dbService.models.setting.destroy({
      where: {},
      truncate: true
    }).then(() => {
      // console.log('设置已销毁');
      this._dbService.models.setting.create({
        id: 1,
        local_port: 8512,
        local_host: '0.0.0.0',
        remote_host: '192.168.0.31',
        remote_port: '6011',
        debug: false,
        record: false
      });
      // console.log('设置初始化完成');
    });
  }

  setLocalAddress(host: string, port: number) {
    this.local_host = host;
    this.local_port = port;
    console.log(`setLocalAddress to ${this.local_host}:${this.local_port}`);
  }

  setRemoteAddress(host: string, port: number) {
    this.remote_host = host;
    this.remote_port = port;
    console.log(`setRemoteAddress to ${this.remote_host}:${this.remote_port}`);
  }

}
