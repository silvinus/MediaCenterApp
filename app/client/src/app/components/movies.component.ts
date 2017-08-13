import { Component, OnInit } from '@angular/core';

// import { Movie } from '../../../../server/src/entity/movie';
import { MovieService } from '../services/movies.service';

@Component({
  selector: 'movies-list',
  templateUrl: '../templates/movies.list.component.html',
  styleUrls: ['../styles/movies.list.component.scss']
})
export class MoviesListComponent implements OnInit {
    movies: any[];

    constructor(private service: MovieService) {

    }

    getMovies(): void {
        this.service
        .movies()
        .then(movies => { 
            console.log(movies);
            this.movies = movies; 
        });
    }

    
    ngOnInit(): void {
        this.getMovies();
    }
}