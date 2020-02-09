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
import {FileStatusTableModule} from "../../components/file-status-table/file-status-table.module";
import {TagEditorDialogModule} from "../../components/tag-editor-dialog/tag-editor-dialog.module";
import {SettingsServiceModule} from "../../services/settings/settings-service.module";
import {SettingsDialog} from "../../components/settings-dialog/settings-dialog.component";
import {SettingsDialogModule} from "../../components/settings-dialog/settings-dialog.module";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {PostProcessorDialog} from "../../components/post-processor-dialog/post-processor-dialog.component";
import {PostProcessorDialogModule} from "../../components/post-processor-dialog/post-processor-dialog.module";

@NgModule({
    entryComponents: [TagEditorDialog, SettingsDialog],
    declarations: [HomeComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,

        SettingsServiceModule,
        FileStatusTableModule,
        TagEditorDialogModule,
        SettingsDialogModule,

        FormsModule,
        ReactiveFormsModule,

        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatMenuModule,
        MatButtonToggleModule
    ]
})
export class HomeModule {
}
