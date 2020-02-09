import {Component, OnInit, ViewChild} from '@angular/core';
import {TagEditorDialog} from "../../components/tag-editor-dialog/tag-editor-dialog.component";
import {YTDLUtils} from "../../utils/ytdl-utils";
import {ActivatedRoute} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {FileStatusTableComponent} from "../../components/file-status-table/file-status-table.component";
import {FileStatus} from "../../model/filestatus.model";
import {ConvertRequest} from "../../model/convertrequest.model";
import {FormControl, Validators} from "@angular/forms";
import {SettingsDialog} from "../../components/settings-dialog/settings-dialog.component";
import {SettingsService} from "../../services/settings/settings.service";
import {YT_URLS} from "../../utils/ytdl-constants";
import {AppManager} from "../../services/request-handler/app-manager.service";

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

    request: ConvertRequest = {url: YT_URLS.Playlist_Test, audioOnly: true};

    urlFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern("^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$")
    ]);

    constructor(private route: ActivatedRoute,
                public appManager: AppManager,
                private settingsService: SettingsService,
                private dialog: MatDialog) {}


    ngOnInit() {
        this.appManager.onFilesStatusUpdated
            .subscribe((fs: FileStatus[]) => { this.fileStatusTable.refreshDataTable(fs); });

        if (this.route.queryParams) {
            this.route.queryParams.subscribe(params => {
                const videoId = params["videoId"];
                if (videoId == void 0) return;

                if (videoId.length === 11) {
                    this.request.url = `https://www.youtube.com/watch?v=${videoId}`;
                    this.appManager.sendConvertRequest(this.request);
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
        this.appManager.sendUpdateRequest();
    }

    public settingsActionClicked() {
        this.openSettingsDialog();
    }

    // #endregion


    //#region Buttons

    public convertButtonClicked() {
        if (this.urlFormControl.invalid) return;
        this.appManager.sendConvertRequest(this.request);
    }

    public downloadButtonClicked() {
        const selectedItems: FileStatus[] = this.fileStatusTable.getSelected();

        if (selectedItems.length < 1) {
            alert("No files selected");
            return;
        }

        this.appManager.sendDownloadAsZipRequest(selectedItems.filter(fs => fs.status == "COMPLETED").map(fs => fs.uuid))
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

        this.appManager.sendDeleteRequest(selectedItems.map(fileStatus => fileStatus.uuid));
        this.fileStatusTable.resetSelection();
    }

    // #endregion


    openTagEditorDialog(event): void {
        const dialogRef = this.dialog.open(TagEditorDialog, {data: YTDLUtils.copyObject(event)});
        dialogRef.afterClosed().subscribe(result => {
            if (result) this.appManager.sendTagRequest(result.uuid, result.name, result.metadata);
        });
    }

    openSettingsDialog(): void {
        const dialogRef = this.dialog.open(SettingsDialog, {width: "300px"});
        dialogRef.afterClosed().subscribe(result => {
            if (result) this.appManager.getSettings();
        });
    }

    setUrl(event) {
        switch (event.value) {
            case "bg":
                this.request.url = YT_URLS.Playlist_Background;
                break;

            case "test":
                this.request.url = YT_URLS.Playlist_Test;
                break;

            case "video":
            default:
                this.request.url = YT_URLS.Video_Test;
                break;
        }
    }
}
