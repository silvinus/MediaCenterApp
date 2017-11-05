import { Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MovieDetailComponent } from "./components/movies.detail.component"

@Component({
  selector: 'app-root',
  templateUrl: './templates/app.component.html',
  styleUrls: ['./styles/app.component.scss']
})
export class AppComponent {
  title = 'greatest Media center app';
}