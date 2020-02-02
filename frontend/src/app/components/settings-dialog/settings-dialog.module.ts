import {NgModule} from '@angular/core';
import {SettingsDialog} from "./settings-dialog.component";
import {MatSliderModule} from "@angular/material/slider";
import {MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {SettingsServiceModule} from "../../services/settings/settings-service.module";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@NgModule({
    declarations: [SettingsDialog],
    imports: [
        FormsModule,

        SettingsServiceModule,
        MatDialogModule,
        MatSliderModule,
        MatButtonModule,
        CommonModule
    ]
})
export class SettingsDialogModule {}
