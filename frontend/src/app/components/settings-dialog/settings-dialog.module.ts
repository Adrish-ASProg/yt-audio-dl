import {NgModule} from '@angular/core';
import {SettingsDialog} from "./settings-dialog.component";
import {MatSliderModule} from "@angular/material/slider";
import {MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {SettingsServiceModule} from "../../services/settings/settings-service.module";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";

@NgModule({
    declarations: [SettingsDialog],
    imports: [
        FormsModule,

        CommonModule,

        SettingsServiceModule,
        MatDialogModule,
        MatSliderModule,
        MatButtonModule,
        MatSelectModule,
        MatInputModule,
        MatDividerModule
    ]
})
export class SettingsDialogModule {}
