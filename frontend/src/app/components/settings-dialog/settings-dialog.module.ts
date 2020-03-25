import {NgModule} from '@angular/core';
import {SettingsDialog} from "./settings-dialog.component";
import {SettingsServiceModule} from "../../services/settings/settings-service.module";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {IonicModule} from "@ionic/angular";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatIconModule} from "@angular/material/icon";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

@NgModule({
    declarations: [SettingsDialog],
    imports: [
        BrowserAnimationsModule,
        FormsModule,
        CommonModule,
        IonicModule,

        SettingsServiceModule,
        MatInputModule,
        MatButtonModule,
        MatAutocompleteModule,
        MatIconModule
    ]
})
export class SettingsDialogModule {}
