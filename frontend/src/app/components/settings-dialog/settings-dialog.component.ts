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
    songDirectory: string;

    constructor(private settings: SettingsService,
                private modalController: ModalController) {

        this.serverAddress = settings.getServerAddress();
        this.songDirectory = settings.getSongsDirectory();
    }

    //region Buttons

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
        this.settings.setSongsDirectory(this.songDirectory);
        this.modalController.dismiss();
    }

    //endregion
}
