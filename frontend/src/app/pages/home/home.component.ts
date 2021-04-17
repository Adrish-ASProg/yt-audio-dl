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
import {AudioPlayerService} from "../../services/audio/audio-player.service";
import {AudioPlayerComponent} from "ngx-audio-player";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {

    @ViewChild(AudioPlayerComponent)
    player: AudioPlayerComponent;

    @ViewChild('mainMenu')
    public menu: MatMenu;

    @ViewChild(MatTabGroup)
    public tabs: MatTabGroup;

    @ViewChild(DownloadTab)
    public downloadTab: DownloadTab;

    displayedColumns: string[] = ['select', 'name', 'status', 'listen', 'startDate'];

    _toolbarButtonsNoFilesSelected: any[] = [
        {
            icon: "refresh",
            action: () => this.downloadTab.refresh()
        }
    ];

    _toolbarButtonsFilesSelected: any[] = [
        {
            icon: "cloud-download-outline",
            action: () => this.downloadTab.downloadButtonClicked()
        },
        {
            icon: "settings-outline",
            action: () => this.downloadTab.postProcessorButtonClicked()
        },
        {
            icon: "trash-outline",
            action: () => this.downloadTab.deleteButtonClicked()
        }
    ];

    constructor(public appManager: AppManager,
                public audioPlayerService: AudioPlayerService,
                private modalController: ModalController,
                private settingsService: SettingsService) {
    }

    get toolbarButtons() {
        return this.downloadTab?.hasFileSelected()
            ? this._toolbarButtonsFilesSelected
            : this._toolbarButtonsNoFilesSelected;
    }

    ngAfterViewInit() {
        this.audioPlayerService.setPlayer(this.player);
        this.displayedColumns = this.settingsService.getDisplayedColumns().split("|");

        // Hacky way to fix default tab not having its inkbar
        timer(600)
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

    // #endregion
}
