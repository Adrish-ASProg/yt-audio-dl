import {Component} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {SettingsService} from "../../services/settings/settings.service";

@Component({
    selector: 'app-playlist-dialog',
    templateUrl: './playlist-dialog.component.html',
    styleUrls: ['./playlist-dialog.component.scss']
})
export class PlaylistDialog {

    showError: boolean = false;
    filePath: string = "";
    savedFolders: string[] = [];

    constructor(private dialogRef: MatDialogRef<PlaylistDialog>,
                private settings: SettingsService) {
        this.savedFolders = settings.getSavedFolders().split("|").filter(s => s != "");
    }

    //#region Buttons

    onYesButtonClicked(): void {
        if (!this.filePath) {
            this.showError = true;
            return;
        }

        this.dialogRef.close({createPlaylist: true, filePath: this.filePath});
    }

    onNoButtonClicked(): void {
        this.dialogRef.close({createPlaylist: false, filePath: ""});
    }

    onCancelButtonClicked(): void { this.dialogRef.close(); }

    // #endregion
}
