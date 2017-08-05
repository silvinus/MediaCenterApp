import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule }    from '@angular/http';

import { AppComponent } from './app.component';
import { MoviesListComponent } from './components/movies.component'
import { MovieService } from './services/movies.service'

@NgModule({
  declarations: [
    AppComponent, MoviesListComponent
  ],
  imports: [
    BrowserModule,
    HttpModule
  ],
  providers: [MovieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
