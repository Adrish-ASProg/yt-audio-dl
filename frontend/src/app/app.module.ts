import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {HttpClientModule} from '@angular/common/http';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatTableModule} from "@angular/material/table";
import {MatSortModule} from "@angular/material/sort";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatIconModule} from "@angular/material/icon";
import {FormsModule} from "@angular/forms";
import {MatToolbarModule} from "@angular/material/toolbar";
import {FileStatusTableComponent} from './components/file-status-table/file-status-table.component';
import {TagEditorDialog} from './components/tag-editor-dialog/tag-editor-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatMenuModule} from "@angular/material/menu";
import {MatCheckboxModule} from "@angular/material/checkbox";

@NgModule({
    entryComponents: [
        TagEditorDialog
    ],
    declarations: [
        AppComponent,
        FileStatusTableComponent,
        TagEditorDialog
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,

        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSlideToggleModule,
        MatButtonModule,
        MatTableModule,


        HttpClientModule,
        MatSortModule,
        MatPaginatorModule,
        MatIconModule,
        FormsModule,
        MatToolbarModule,
        MatDialogModule,
        MatCheckboxModule,
        MatMenuModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
