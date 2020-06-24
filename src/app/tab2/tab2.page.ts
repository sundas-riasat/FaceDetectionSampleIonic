import { Component } from '@angular/core';
import {ApiService} from '../api.service';
import {NavController, Platform} from '@ionic/angular';
import {Router} from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {


  url = '';
  constructor( private apiService: ApiService, private platform: Platform, private nav: NavController, private router: Router) {
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.nav.navigateRoot('');
    });
    this.url = apiService.getURL();
  }

  setURL(){
    this.apiService.setURL(this.url);
    this.router.navigateByUrl('/tabs/tab1');
  }

}
