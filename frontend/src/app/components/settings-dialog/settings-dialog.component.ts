import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SettingsService} from "../../services/settings/settings.service";

@Component({
    selector: 'app-settings-dialog',
    templateUrl: './settings-dialog.component.html',
    styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialog {

    refreshRate: number;

    savedFolders: string[] = [];
    folderToSave: string = "";
    selectedFolder: string = "";

    constructor(private settings: SettingsService,
                private dialogRef: MatDialogRef<SettingsDialog>,
                @Inject(MAT_DIALOG_DATA) public result: boolean) {

        this.refreshRate = settings.getRefreshRate();
        this.savedFolders = settings.getSavedFolders().split("|").filter(s => s != "");
        if (this.savedFolders.length > 0) this.selectedFolder = this.savedFolders[0];
    }

    //#region Refresh rate

    formatRefreshRate(): string {
        if (this.refreshRate < 1000) return this.refreshRate + "ms";
        else if (this.refreshRate < 60000) return Math.round(this.refreshRate * 10 / 1000) / 10 + "s";
        else return Math.round(this.refreshRate * 10 / 1000 / 60) / 10 + "mn";
    }

    getSliderStep(): number {
        if (this.refreshRate < 1000) return 100;
        else if (this.refreshRate < 10000) return 1000;
        else if (this.refreshRate < 60000) return 10000;
        else return 30000;
    }

    // #endregion

    //#region Playlist folders

    addFolder(): void {
        if (this.savedFolders.includes(this.folderToSave)) return;
        this.savedFolders.push(this.folderToSave);
        this.settings.setSavedFolders(this.savedFolders.join("|"));
        this.selectedFolder = this.savedFolders[this.savedFolders.length - 1];
    }

    deleteFolder() {
        if (!this.savedFolders.includes(this.selectedFolder)) return;
        this.savedFolders = this.savedFolders.filter(f => f !== this.selectedFolder);
        this.settings.setSavedFolders(this.savedFolders.join("|"));
        if (this.savedFolders.length > 0) this.selectedFolder = this.savedFolders[0];
    }

    // #endregion


    onValidButtonClicked(): void {
        this.result = this.settings.setRefreshRate(this.refreshRate);
        this.dialogRef.close(this.result);
    }

    onCancelButtonClicked(): void { this.dialogRef.close(); }

}
