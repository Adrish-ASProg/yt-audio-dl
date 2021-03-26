import {MatIconModule} from "@angular/material/icon";
import {TestBed, waitForAsync} from '@angular/core/testing';
import {MatMenuModule} from "@angular/material/menu";
import {BrowserModule} from "@angular/platform-browser";
import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

import {IonicModule} from "@ionic/angular";
import {StatusBar} from "@ionic-native/status-bar/ngx";
import {SplashScreen} from "@ionic-native/splash-screen/ngx";
import {AndroidPermissions} from "@ionic-native/android-permissions/ngx";

import {AppComponent} from './app.component';
import {HomeModule} from "./pages/home/home.module";
import {AppRoutingModule} from "./app-routing.module";

describe('AppComponent', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                BrowserModule,
                AppRoutingModule,
                BrowserAnimationsModule,
                IonicModule,

                HomeModule,

                MatToolbarModule,
                MatMenuModule,
                MatIconModule,
                MatButtonModule
            ],
            declarations: [AppComponent],
            providers: [AndroidPermissions, SplashScreen, StatusBar]
        }).compileComponents();
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });
});
