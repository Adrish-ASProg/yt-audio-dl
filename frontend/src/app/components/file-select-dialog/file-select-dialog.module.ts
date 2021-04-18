import {NgModule} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MatDialogModule} from "@angular/material/dialog";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {IonicModule} from "@ionic/angular";
import {FileSelectDialog} from "./file-select-dialog.component";
import {MatListModule} from "@angular/material/list";

@NgModule({
    declarations: [FileSelectDialog],
    imports: [
        BrowserAnimationsModule,
        FormsModule,

        IonicModule,

        MatDialogModule,
        MatButtonModule,
        MatListModule
    ]
})
export class FileSelectDialogModule {
}
