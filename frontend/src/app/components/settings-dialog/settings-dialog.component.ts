import {Component} from '@angular/core';
import {SettingsService} from "../../services/settings/settings.service";
import {ModalController} from '@ionic/angular';

@Component({
    selector: 'app-settings-dialog',
    templateUrl: './settings-dialog.component.html',
    styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialog {

    serverAddress: string;

    savedFolders: string[] = [];
    folderToSave: string = "";
    selectedFolder: string = "";

    constructor(private settings: SettingsService,
                private modalController: ModalController) {

        this.serverAddress = settings.getServerAddress();
        this.savedFolders = settings.getSavedFolders().split("|").filter(s => s != "");
        if (this.savedFolders.length > 0) this.selectedFolder = this.savedFolders[0];
    }

    //#region Playlist folders

    addFolder(): void {
        if (this.savedFolders.includes(this.folderToSave)) return;
        this.savedFolders.push(this.folderToSave);
        this.settings.setSavedFolders(this.savedFolders.join("|"));
        this.selectedFolder = this.savedFolders[this.savedFolders.length - 1];
    }

    deleteFolder(): void {
        if (!this.savedFolders.includes(this.selectedFolder)) return;
        this.savedFolders = this.savedFolders.filter(f => f !== this.selectedFolder);
        this.settings.setSavedFolders(this.savedFolders.join("|"));
        if (this.savedFolders.length > 0) this.selectedFolder = this.savedFolders[0];
    }

    // #endregion

    //#region Buttons

    onCloseButtonClicked(): void {
        this.modalController.dismiss();
    }

    onResetButtonClicked(): void {
        if (confirm("Do you really want to reset all your preferences ?\n" +
            "This cannot be undone.")) {
            this.settings.resetPreferences();
            window.location.reload();
        }
    }

    onSaveButtonClicked(): void {
        this.settings.setServerAddress(this.serverAddress);
        this.modalController.dismiss();
    }

    // #endregion
}
