import {Component, OnInit} from '@angular/core';
import {NavParams} from "@ionic/angular";

@Component({
  selector: 'app-menu-popover',
  templateUrl: './menu-popover.component.html',
  styleUrls: ['./menu-popover.component.scss'],
})
export class MenuPopoverComponent implements OnInit {

    menuButtons: { label: string, action: () => void }[] = [];

    constructor(navParams: NavParams) {
        this.menuButtons = navParams.get('buttons');
        // this.pop = navParams.get('popoverController');
    }

  ngOnInit() {}

}
