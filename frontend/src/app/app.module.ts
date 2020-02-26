import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {RouteReuseStrategy} from "@angular/router";

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {File} from '@ionic-native/file/ngx';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeModule} from "./pages/home/home.module";
import {AppManagerModule} from "./services/request-handler/app-manager.module";
import {AndroidPermissions} from "@ionic-native/android-permissions/ngx";
import {MenuPopoverModule} from "./components/menu-popover/menu-popover.module";
import {MenuPopoverComponent} from "./components/menu-popover/menu-popover.component";

@NgModule({
    entryComponents: [MenuPopoverComponent],
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        BrowserAnimationsModule,

        AppManagerModule,
        HomeModule,

        MenuPopoverModule
    ],
    providers: [
        StatusBar,
        SplashScreen,
        AndroidPermissions,
        File,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
