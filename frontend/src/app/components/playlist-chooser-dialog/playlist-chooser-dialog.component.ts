import {Component, Inject} from '@angular/core';
import {Playlist} from "../../model/playlist.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
    selector: 'app-playlist-chooser-dialog',
    templateUrl: './playlist-chooser-dialog.component.html',
    styleUrls: ['./playlist-chooser-dialog.component.scss'],
})
export class PlaylistChooserDialog {

    playlistName: string;

    constructor(private dialogRef: MatDialogRef<PlaylistChooserDialog>,
                @Inject(MAT_DIALOG_DATA) public data: { playlists: Playlist[] }) {
    }

    validate() {
        this.dialogRef.close(this.playlistName);
    }

    close() {
        this.dialogRef.close();
    }
}
