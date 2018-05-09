import { Component } from '@angular/core';
import { Routes, ActivatedRoute, UrlSegment } from '@angular/router';
import { MovieDetailComponent } from './components/movies.detail.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './templates/app.component.html',
  styleUrls: ['./styles/app.component.scss']
})
export class AppComponent {
  title = 'greatest Media center app';
  currentMenu: String = 'home';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    activatedRoute.url.subscribe((url: any) => this.currentMenu = this.router.url);
  }

  navigate(current: String) {
    this.currentMenu = current;
    this.router.navigate(['/' + this.currentMenu]);
  }
}
