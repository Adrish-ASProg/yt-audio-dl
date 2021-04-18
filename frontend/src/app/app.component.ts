import {Component} from '@angular/core';

import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    constructor(private androidPermissions: AndroidPermissions,
                private platform: Platform,
                private splashScreen: SplashScreen,
                private statusBar: StatusBar) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {

            if (!this.platform.is("cordova")) {
                return;
            }

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
}
