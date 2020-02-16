import {NgModule} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {TagEditorDialog} from "./tag-editor-dialog.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatDialogModule} from "@angular/material/dialog";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

@NgModule({
    declarations: [TagEditorDialog],
    imports: [
        BrowserAnimationsModule,
        FormsModule,

        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatButtonModule
    ]
})
export class TagEditorDialogModule {}
