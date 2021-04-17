import {NgModule} from '@angular/core';
import {HomeComponent} from "./home.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatMenuModule} from "@angular/material/menu";
import {BrowserModule} from "@angular/platform-browser";
import {MatCheckboxModule} from "@angular/material/checkbox";

import {SettingsServiceModule} from "../../services/settings/settings-service.module";
import {SettingsDialog} from "../../components/settings-dialog/settings-dialog.component";
import {SettingsDialogModule} from "../../components/settings-dialog/settings-dialog.module";
import {MatTabsModule} from "@angular/material/tabs";
import {DownloadTabModule} from "../../tabs/download/download.tab.module";
import {UploadTabModule} from "../../tabs/upload/upload.tab.module";
import {IonicModule} from "@ionic/angular";
import {NgxAudioPlayerModule} from "ngx-audio-player";
import {AudioPlayerModule} from "../../services/audio/audio-player.module";

@NgModule({
    entryComponents: [SettingsDialog],
    declarations: [HomeComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        IonicModule,

        SettingsServiceModule,
        SettingsDialogModule,
        DownloadTabModule,
        UploadTabModule,
        AudioPlayerModule,

        MatMenuModule,
        MatCheckboxModule,
        MatTabsModule,

        NgxAudioPlayerModule
    ]
})
export class HomeModule {
}
