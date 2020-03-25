import {NgModule} from '@angular/core';
import {HomeComponent} from "./home.component";
import {TagEditorDialog} from "../../components/tag-editor-dialog/tag-editor-dialog.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatMenuModule} from "@angular/material/menu";
import {BrowserModule} from "@angular/platform-browser";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatIconModule} from "@angular/material/icon";

import {IonicModule} from "@ionic/angular";

import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatCheckboxModule} from "@angular/material/checkbox";

import {FileStatusTableModule} from "../../components/file-status-table/file-status-table.module";
import {TagEditorDialogModule} from "../../components/tag-editor-dialog/tag-editor-dialog.module";
import {SettingsServiceModule} from "../../services/settings/settings-service.module";
import {SettingsDialog} from "../../components/settings-dialog/settings-dialog.component";
import {SettingsDialogModule} from "../../components/settings-dialog/settings-dialog.module";
import {ToolsDialog} from "../../components/tools-dialog/tools-dialog.component";
import {ToolsDialogModule} from "../../components/tools-dialog/tools-dialog.module";
import {MatTabsModule} from "@angular/material/tabs";

@NgModule({
    entryComponents: [TagEditorDialog, ToolsDialog, SettingsDialog],
    declarations: [HomeComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,

        IonicModule,

        SettingsServiceModule,
        FileStatusTableModule,
        TagEditorDialogModule,
        ToolsDialogModule,
        SettingsDialogModule,

        FormsModule,
        ReactiveFormsModule,

        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatMenuModule,
        MatButtonToggleModule,
        MatProgressBarModule,
        MatIconModule,
        MatCheckboxModule,
        MatTabsModule
    ]
})
export class HomeModule {
}
