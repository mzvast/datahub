import { SettingService } from './../setting.service';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class SettingsComponent implements OnInit {
  localPort: number;

  constructor(private _settingService: SettingService) {
    setTimeout(() => {
      this.localPort = this._settingService.local_port;
      console.log(this.localPort);
    }, 500);
  }

  ngOnInit() {
  }

  save() {
    console.log(this._settingService.local_port);
  }

  initSetting() {
    this._settingService.initSetting();
  }

}
