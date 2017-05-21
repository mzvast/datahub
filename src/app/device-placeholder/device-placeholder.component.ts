import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-device-placeholder',
  templateUrl: './device-placeholder.component.html',
  styleUrls: ['./device-placeholder.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DevicePlaceholderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
