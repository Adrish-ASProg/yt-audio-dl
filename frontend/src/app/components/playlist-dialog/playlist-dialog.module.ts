import {NgModule} from '@angular/core';
import {PlaylistDialog} from "./playlist-dialog.component";
import {MatDialogModule} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MatAutocompleteModule} from "@angular/material/autocomplete";

@NgModule({
    imports: [
        FormsModule,
        CommonModule,

        MatDialogModule,
        MatInputModule,
        MatButtonModule,
        MatAutocompleteModule
    ],
    declarations: [PlaylistDialog]
})
export class PlaylistDialogModule {}
