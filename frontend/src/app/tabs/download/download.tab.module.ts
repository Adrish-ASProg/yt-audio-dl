import {NgModule} from '@angular/core';
import {BrowserModule} from "@angular/platform-browser";
import {IonicModule} from "@ionic/angular";
import {DownloadTab} from "./download.tab";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {FileStatusTableModule} from "../../components/file-status-table/file-status-table.module";
import {ToolsDialogModule} from "../../components/tools-dialog/tools-dialog.module";
import {TagEditorDialogModule} from "../../components/tag-editor-dialog/tag-editor-dialog.module";

@NgModule({
    entryComponents: [],
    declarations: [DownloadTab],
    imports: [
        IonicModule,
        FormsModule,
        BrowserModule,
        ReactiveFormsModule,

        ToolsDialogModule,
        TagEditorDialogModule,
        FileStatusTableModule,

        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
    ],
    exports: [DownloadTab],
    providers: []
})
export class DownloadTabModule {
}
