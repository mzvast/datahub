import { DatabaseService } from './database.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  providers: [DatabaseService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string;
  constructor(databaseService: DatabaseService) {
    this.title = databaseService.getData();
  }
}
