import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';
import { HttpModule  } from '@angular/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@angular/material';

import { AppComponent } from './app.component';
import { MoviesListComponent } from './components/movies.component';
import { MovieDetailComponent } from './components/movies.detail.component';
import { MovieService } from './services/movies.service';
import { UpnpService } from './services/upnp.service';
// import { slideInDownAnimation } from './animations/animations'

@NgModule({
  declarations: [
    AppComponent, MoviesListComponent, MovieDetailComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    HttpModule,
    RouterModule.forRoot([
      { path: '', redirectTo: 'home', pathMatch: 'full'},
      { path: 'home', component: MoviesListComponent},
      { path: 'movie/:id', component: MovieDetailComponent},
      { path: '**', component: MoviesListComponent }
    ], {useHash: true, enableTracing: true}),
    MaterialModule,
    FormsModule
    // slideInDownAnimation
  ],
  providers: [MovieService, UpnpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
