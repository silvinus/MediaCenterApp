import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpModule  } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatGridListModule } from '@angular/material/grid-list';

import { AppComponent } from './app.component';
import { MoviesListComponent } from './components/movies.component';
import { MovieDetailComponent } from './components/movies.detail.component';
import { HomeComponent } from './components/home.components';
import { SettingsComponent } from './components/settings.component';

import { MovieService } from './services/movies.service';
import { UpnpService } from './services/upnp.service';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
// import { slideInDownAnimation } from './animations/animations'

@NgModule({
  declarations: [
    AppComponent, HomeComponent, SettingsComponent, MoviesListComponent, MovieDetailComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    HttpModule,
    RouterModule.forRoot([
      { path: '', redirectTo: 'home', pathMatch: 'full'},
      { path: 'home', component: HomeComponent},
      { path: 'movies', component: MoviesListComponent},
      { path: 'movie/:id', component: MovieDetailComponent},
      { path: 'settings', component: SettingsComponent},
      { path: '**', component: MoviesListComponent }
    ], {useHash: true, enableTracing: true}),
    MatGridListModule,
    FormsModule,
    MDBBootstrapModule.forRoot()

    // slideInDownAnimation
  ],
  schemas: [ NO_ERRORS_SCHEMA ],
  providers: [MovieService, UpnpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
