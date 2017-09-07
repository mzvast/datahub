import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import {SettingService} from '../setting.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DataComponent implements OnInit {
  protocols = [
    {
      name: '标签包',
      url: 'tag'
    }, {
      name: '全脉冲',
      url: 'pdw'
    }, {
      name: '辐射源',
      url: 'radiation'
    }
  ];
  constructor(private _settingService: SettingService) {
    this._settingService.fetchSettingFromDB().then(() => {
      this.protocols.push({url : 'custom6', name: _settingService.fetchCustomName(6)});
      this.protocols.push({url : 'custom7', name: _settingService.fetchCustomName(7)});
      this.protocols.push({url : 'custom8', name: _settingService.fetchCustomName(8)});
      this.protocols.push({url : 'custom9', name: _settingService.fetchCustomName(9)});
      this.protocols.push({url : 'custom10', name: _settingService.fetchCustomName(10)});
      this.protocols.push({url : 'pkg', name: '*原始数据'});
    });
  }

  ngOnInit() {
  }

}
