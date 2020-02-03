import {NgModule} from '@angular/core';
import {FileStatusTableComponent} from "./file-status-table.component";
import {MatTableModule} from "@angular/material/table";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatSortModule} from "@angular/material/sort";
import {MatIconModule} from "@angular/material/icon";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatButtonModule} from "@angular/material/button";

@NgModule({
    entryComponents: [],
    declarations: [FileStatusTableComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,

        MatTableModule,
        MatCheckboxModule,
        MatPaginatorModule,
        MatSortModule,
        MatIconModule,
        MatButtonModule
    ],
    exports: [FileStatusTableComponent],
    providers: []
})
export class FileStatusTableModule {
}
