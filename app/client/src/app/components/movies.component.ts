import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router, ParamMap } from '@angular/router';

// import { Movie } from '../../../../server/src/entity/movie';
import { MovieService } from '../services/movies.service';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-movies-list',
  templateUrl: '../templates/movies.list.component.html',
  styleUrls: ['../styles/movies.list.component.scss']
})
export class MoviesListComponent implements OnInit {
    movies: Observable<any[]>;
    selectedMovie; any;
    private selectedId: number;

    constructor(private service: MovieService,
                private router: Router) {
    }

    ngOnInit(): void {
        this.movies = this.service.movies();
    }

    onSelect(movie: any) {
        this.router.navigate(['/movie', movie._metadata._imdbId]);
    }
}
