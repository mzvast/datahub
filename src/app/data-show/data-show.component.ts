import { DataShowDialogComponent } from './../data-show-dialog/data-show-dialog.component';
import { DatabaseService } from './../database.service';
import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MdDialog } from '@angular/material';


@Component({
  selector: 'app-data-show',
  templateUrl: './data-show.component.html',
  styleUrls: ['./data-show.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class DataShowComponent implements OnInit, OnDestroy {
  type: string;
  private sub: any;
  data = [];
  rows = [];
  selected = [];
  columns: any[] = [
    { name: '时间', prop: 'time' },
    { name: '数据', prop: 'raw' }
  ];

  constructor(
    private route: ActivatedRoute,
    private db: DatabaseService,
    private dialog: MdDialog) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.type = params['type']; //
      // In a real app: dispatch action to load the details here.
      this.db.authenticate();
      this.fetch();

    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  openDialog() {
    this.dialog.open(DataShowDialogComponent);
  }

  fetch() {
    this.db.models[this.type].findAll()
      .then((data) => {
        console.log(data);
        // console.log(data[0].raw.toString());
        // console.log(data[0].createdAt);
        this.rows = data.map((curVal, index, arr) => {
          return {
            time: curVal.createdAt.toString(),
            raw: curVal.raw.toString()
          };
        });
        // console.log(this.data);
      })
      .catch((error) => {
        console.log('error:', error);
      });
  }

  onSelect({ selected }) {
    this.dialog.open(DataShowDialogComponent, {
      data: {
        raw: this.selected[0]['raw'],
        type: this.type
      }
    });
    console.log('Select Event', selected, this.selected);
  }

  onActivate(event) {
    // console.log('Activate Event', event);
  }

  updateRowPosition() {
    const ix = this.getSelectedIx();
    const arr = [...this.rows];
    arr[ix - 1] = this.rows[ix];
    arr[ix] = this.rows[ix - 1];
    this.rows = arr;
  }

  getSelectedIx() {
    return this.selected[0]['$$index'];
  }

}
