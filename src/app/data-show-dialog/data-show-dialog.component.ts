import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Inject, Optional } from '@angular/core';
import { MD_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-data-show-dialog',
  templateUrl: './data-show-dialog.component.html',
  styleUrls: ['./data-show-dialog.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DataShowDialogComponent implements OnInit {

  constructor(@Optional() @Inject(MD_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
