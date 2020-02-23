import {Component, OnInit, ViewChild} from '@angular/core';
import {TagEditorDialog} from "../../components/tag-editor-dialog/tag-editor-dialog.component";
import {YTDLUtils} from "../../utils/ytdl-utils";
import {ActivatedRoute} from "@angular/router";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FileStatusTableComponent} from "../../components/file-status-table/file-status-table.component";
import {FileStatus} from "../../model/filestatus.model";
import {FormControl, Validators} from "@angular/forms";
import {SettingsDialog} from "../../components/settings-dialog/settings-dialog.component";
import {YT_URLS} from "../../utils/ytdl-constants";
import {AppManager} from "../../services/request-handler/app-manager.service";
import {PostProcessorDialog} from "../../components/post-processor-dialog/post-processor-dialog.component";
import {PlaylistDialog} from "../../components/playlist-dialog/playlist-dialog.component";
import {ModalController} from "@ionic/angular";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    menu: any = [
        {label: "Refresh", action: () => this.refreshActionClicked()},
        {label: "Settings", action: () => this.settingsActionClicked()}
    ];

    @ViewChild(FileStatusTableComponent, {static: false})
    fileStatusTable: FileStatusTableComponent;

    displayedColumns: string[] = ['select', 'name', 'status', 'startDate'];

    urlFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern("^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$")
    ]);

    constructor(private route: ActivatedRoute,
                public appManager: AppManager,
                private dialog: MatDialog,
                private modalController: ModalController) {}


    ngOnInit() {
        this.urlFormControl.setValue(YT_URLS.Playlist_Test);

        this.appManager.onFilesStatusUpdated
            .subscribe((fs: FileStatus[]) => { this.fileStatusTable.refreshDataTable(fs); });

        if (this.route.queryParams) {
            this.route.queryParams.subscribe(params => {
                const videoId = params["videoId"];
                if (videoId == void 0) return;

                if (videoId.length === 11) {
                    this.urlFormControl.setValue(`https://www.youtube.com/watch?v=${videoId}`);
                    this.appManager.sendConvertRequest(this.urlFormControl.value);
                }
            });
        }
    }


    //#region Menu

    public getMenu() {
        return this.menu;
    }

    public refreshActionClicked() {
        this.fileStatusTable.resetSelection();
        this.appManager.runAutomaticUpdate();
    }

    public settingsActionClicked() {
        this.openSettingsDialog();
    }

    // #endregion


    //#region Buttons

    public convertButtonClicked() {
        if (this.urlFormControl.invalid) return;
        this.appManager.sendConvertRequest(this.urlFormControl.value);
    }

    public downloadButtonClicked() {
        const selectedItems: FileStatus[] = this.fileStatusTable.getSelected();

        if (selectedItems.length < 1) {
            alert("No files selected");
            return;
        }

        const ids: string[] = selectedItems.filter(fs => fs.status == "COMPLETED").map(fs => fs.id);

        // Download only one file
        if (ids.length == 1) this.appManager.sendDownloadRequest(ids[0]);

        // Download file as zip (+ eventually playlist)
        else {
            const dialogRef = this.openPlaylistDialog();
            dialogRef.afterClosed().subscribe(result => {
                if (!result) return;
                this.appManager.sendDownloadAsZipRequest(ids, result.createPlaylist, result.filePath);
            });
        }
    }

    public postProcessorButtonClicked() {
        const selectedItems: FileStatus[] = this.fileStatusTable.getSelected();

        if (selectedItems.length < 1) {
            alert("No files selected");
            return;
        }

        this.openPostProcessorDialog(selectedItems);
    }

    public deleteButtonClicked() {
        const selectedItems = this.fileStatusTable.getSelected();

        if (selectedItems.length < 1) {
            alert("No files selected");
            return;
        }

        const confirmMsg: string = selectedItems.length > 1
            ? `Do you really want to delete these ${selectedItems.length} files ?`
            : `Do you really want to delete « ${selectedItems[0].name} » ?`;

        if (!confirm(confirmMsg)) return;

        this.appManager.sendDeleteRequest(selectedItems.map(fileStatus => fileStatus.id));
        this.fileStatusTable.resetSelection();
    }

    // #endregion

    setUrl(event) {
        switch (event.value) {
            case "bg":
                this.urlFormControl.setValue(YT_URLS.Playlist_Background);
                break;

            case "test":
                this.urlFormControl.setValue(YT_URLS.Playlist_Test);
                break;

            case "video":
            default:
                this.urlFormControl.setValue(YT_URLS.Video_Test);
                break;
        }
    }

    public openTagEditorDialog(event): void {
        const dialogRef = this.dialog.open(TagEditorDialog, {data: YTDLUtils.copyObject(event)});
        dialogRef.afterClosed().subscribe(result => {
            if (!result) return;
            this.appManager.sendTagRequest(result.id, result.name, result.metadata);
        });
    }

    private openPostProcessorDialog(selectedItems: FileStatus[]): void {
        const dialogRef = this.dialog.open(PostProcessorDialog, {data: {fileStatus: selectedItems}});
        dialogRef.afterClosed().subscribe((result: FileStatus[]) => {
            if (!result) return;

            result.forEach(fs => this.appManager.sendTagRequest(fs.id, fs.name, fs.metadata));
            this.appManager.sendUpdateRequest().subscribe(fs => this.fileStatusTable.refreshDataTable(fs));
        });
    }

    private async openSettingsDialog(): Promise<void> {
        const modal = await this.modalController.create({component: SettingsDialog});
        modal.onDidDismiss().then(_ => this.appManager.getSettings());
        return modal.present();
    }

    private openPlaylistDialog(): MatDialogRef<PlaylistDialog, any> {
        return this.dialog.open(PlaylistDialog, {width: "300px"});
    }
}
