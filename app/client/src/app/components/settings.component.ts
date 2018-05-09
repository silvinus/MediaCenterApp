import { Component, OnInit } from '@angular/core';
import { SettingService } from '../services/settings.service';
import { Observable } from 'rxjs/Observable';
import { Settings, Slave } from '../model/settings';
import { MovieService } from '../services/movies.service';

@Component({
  selector: 'app-media-settings',
  templateUrl: '../templates/settings.component.html',
  styleUrls: []
})
export class SettingsComponent implements OnInit {
  slaves: Slave[];
  synchInProgress: boolean;

  constructor(private settingService: SettingService,
             private movieService: MovieService) {
    this.synchInProgress = false;
  }

  ngOnInit(): void {
    this.settingService.settings()
                        .subscribe(
                          (data) => this.slaves = data.slaves);
  }

  validate(): void {
    const s = new Settings();
    this.slaves
        .forEach(w => {
          w.scanPaths = w.scanPaths.filter(x => x !== '');
          s.slaves.push(w);
        });

    this.settingService.save(s)
                      .subscribe(
                        (data) => this.slaves = data.slaves);
  }

  async sync(): Promise<any> {
    this.synchInProgress = true;
    await this.movieService.synchronize();
    this.synchInProgress = false;
  }

  addSlave(): void {
    this.slaves.push(new Slave());
  }

  customTrackBy(index: number, obj: any) {
    return index;
  }
}
