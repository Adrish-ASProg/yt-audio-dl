import {Component} from '@angular/core';

import {Platform, PopoverController} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';
import {MenuPopoverComponent} from "./components/menu-popover/menu-popover.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    // Toolbar
    projectTitle: string = 'YT-Audio-DL';

    menuButtons: { label: string, action: () => void }[] = [];

    popover: HTMLIonPopoverElement;

    constructor(private platform: Platform,
                private splashScreen: SplashScreen,
                private statusBar: StatusBar,
                private popoverController: PopoverController,
                private androidPermissions: AndroidPermissions) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();

            this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
                result => {
                    if (!result.hasPermission) this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE])
                },
                err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
            );
        });
    }

    public onRouterOutletActivate(event: any) {
        this.menuButtons = event.getMenu ? event.getMenu() : [];
    }

    public async showMenu(event) {
        this.popover = await this.popoverController.create({
            component: MenuPopoverComponent,
            event,
            componentProps: {buttons: this.menuButtons},
            translucent: true
        });
        return this.popover.present();
    }
}
