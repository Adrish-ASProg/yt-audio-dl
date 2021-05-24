import {NgModule} from '@angular/core';
import {PlaylistChooserDialog} from "./playlist-chooser-dialog.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatInputModule} from "@angular/material/input";
import {MatDialogModule} from "@angular/material/dialog";
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";

@NgModule({
    declarations: [PlaylistChooserDialog],
    imports: [
        CommonModule,
        FormsModule,

        MatAutocompleteModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
    ]
})
export class PlaylistChooserDialogModule {
}
