import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeModule} from "./pages/home/home.module";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatButtonModule} from "@angular/material/button";
import {AppManagerModule} from "./services/request-handler/app-manager.module";

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,

        AppManagerModule,
        HomeModule,

        MatToolbarModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
