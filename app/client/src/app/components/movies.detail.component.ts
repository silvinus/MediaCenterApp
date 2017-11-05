import 'rxjs/add/operator/switchMap';
import { Component, OnInit, HostBinding } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { slideInDownAnimation } from '../animations/animations';
import { MovieService } from '../services/movies.service';
import { UpnpService, Device } from '../services/upnp.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'movie-detail',
  templateUrl: '../templates/movies.detail.component.html',
  styleUrls: ['../styles/movies.detail.component.scss'],
  // make fade in animation available to this component
  // animations: [slideInDownAnimation],
  // // attach the fade in animation to the host (root) element of this component
  // host: { '[@slideInDownAnimation]': '' }
})
export class MovieDetailComponent implements OnInit {

    movieImdbId: number;
    selectedDevice: Device;
    private movie: any;
    private devices: Observable<Device[]>;

    constructor(private service: MovieService,
                private route: ActivatedRoute,
                private router: Router,
                private upnp: UpnpService) {
    }

    ngOnInit() {
      this.route.paramMap
          .switchMap((params: ParamMap) => {
                console.log(params);
                this.movieImdbId = +params.get('id');
                return this.service.movie(this.movieImdbId);
            })
          .subscribe((movie: any) => this.movie = movie);

          this.devices = this.upnp.devices();
          this.devices.subscribe(w => console.log(w));
    }

    playOn() {
      console.log('play ', this.movie, ' on ', this.selectedDevice);
      this.upnp.play(this.selectedDevice, this.movie);
    }
}
