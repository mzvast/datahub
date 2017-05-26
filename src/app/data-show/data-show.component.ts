import { DatabaseService } from './../database.service';
import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


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

  constructor(private route: ActivatedRoute, private db: DatabaseService) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.type = params['type']; //
      // In a real app: dispatch action to load the details here.
      this.db.authenticate();
      this.db.create('tag', 'abcd');
      this.db.getAll('tag');
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}