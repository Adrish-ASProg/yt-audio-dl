import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {SettingsDialog} from "../../components/settings-dialog/settings-dialog.component";
import {YT_URLS} from "../../utils/ytdl-constants";
import {AppManager} from "../../services/request-handler/app-manager.service";
import {ModalController} from "@ionic/angular";
import {MatMenu} from "@angular/material/menu";
import {SettingsService} from "../../services/settings/settings.service";
import {timer} from "rxjs";
import {take} from "rxjs/operators";
import {MatTabGroup} from "@angular/material/tabs";
import {DownloadTab} from "../../tabs/download/download.tab";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {

    @ViewChild('mainMenu')
    public menu: MatMenu;

    @ViewChild(MatTabGroup)
    public tabs: MatTabGroup;

    @ViewChild(DownloadTab)
    public downloadTab: DownloadTab;

    displayedColumns: string[] = ['select', 'name', 'status', 'startDate'];

    constructor(public appManager: AppManager,
                private modalController: ModalController,
                private settingsService: SettingsService,) {
    }

    ngAfterViewInit() {
        this.displayedColumns = this.settingsService.getDisplayedColumns().split("|");

        // Hacky way to fix default tab not having its inkbar
        timer(500)
            .pipe(take(1))
            .subscribe(() => this.tabs.realignInkBar());
    }


    //#region Menu

    public updateDisplayedColumns(value: string) {
        this.displayedColumns.includes(value)
            ? this.displayedColumns = this.displayedColumns.filter(c => c !== value)
            : this.displayedColumns.push(value);

        this.settingsService.setDisplayedColumns(
            this.displayedColumns.join('|')
        );
    }

    public settingsActionClicked() {
        this.openSettingsDialog();
    }

    // #endregion

    setUrl(event) {
        let value;

        switch (event) {
            case "bg":
                value = YT_URLS.Playlist_Background;
                break;

            case "test":
                value = YT_URLS.Playlist_Test;
                break;

            case "video":
            default:
                value = YT_URLS.Video_Test;
                break;
        }

        this.downloadTab.setUrl(value);
    }

    private async openSettingsDialog(): Promise<void> {
        const modal = await this.modalController.create({
            component: SettingsDialog,
            cssClass: 'settings-dialog'
        });
        return modal.present();
    }
}
