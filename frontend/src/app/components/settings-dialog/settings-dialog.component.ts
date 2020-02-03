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

    constructor(private settings: SettingsService,
                private dialogRef: MatDialogRef<SettingsDialog>,
                @Inject(MAT_DIALOG_DATA) public result: boolean) {

        this.refreshRate = settings.getRefreshRate();
    }

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

    onValidButtonClicked(): void {
        this.result = this.settings.setRefreshRate(this.refreshRate);
        this.dialogRef.close(this.result);
    }

    onCancelButtonClicked(): void { this.dialogRef.close(); }

}
