import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router, ParamMap } from '@angular/router';
import { MovieService } from '../services/movies.service';

@Component({
  selector: 'app-movies-list',
  templateUrl: '../templates/movies.list.component.html',
  styleUrls: ['../styles/movies.list.component.scss']
})
export class MoviesListComponent implements OnInit {
    movies: Observable<any[]>;
    selectedMovie; any;
    healthcheckSlave: Array<any>;
    private selectedId: number;

    constructor(private service: MovieService,
                private router: Router) {
    }

    async ngOnInit(): Promise<void> {
        this.healthcheckSlave = await this.service.healthCheckSlave();
        this.movies = this.service.movies();
    }

    isAlive(slaveName): Boolean {
        const slave = this.healthcheckSlave.filter(w => w.slave.name === slaveName);
        if (slave.length === 0) { return false; }

        return slave[0].isAlive;
    }

    onSelect(movie: any) {
        this.router.navigate(['/movie', movie.metadata.imdbId]);
    }
}
