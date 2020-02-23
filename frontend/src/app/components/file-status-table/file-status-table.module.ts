import {NgModule} from '@angular/core';
import {FileStatusTableComponent} from "./file-status-table.component";
import {MatTableModule} from "@angular/material/table";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatSortModule} from "@angular/material/sort";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatButtonModule} from "@angular/material/button";
import {EllipsisModule} from "ngx-ellipsis";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {IonicModule} from "@ionic/angular";

@NgModule({
    entryComponents: [],
    declarations: [FileStatusTableComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,

        IonicModule,

        MatTableModule,
        MatCheckboxModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,

        EllipsisModule
    ],
    exports: [FileStatusTableComponent],
    providers: []
})
export class FileStatusTableModule {
}
