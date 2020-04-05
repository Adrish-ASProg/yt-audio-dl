import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {TagEditorDialog} from "../../components/tag-editor-dialog/tag-editor-dialog.component";
import {YTDLUtils} from "../../utils/ytdl-utils";
import {MatDialog} from "@angular/material/dialog";
import {FileStatusTableComponent} from "../../components/file-status-table/file-status-table.component";
import {FileStatus} from "../../model/filestatus.model";
import {FormControl, Validators} from "@angular/forms";
import {SettingsDialog} from "../../components/settings-dialog/settings-dialog.component";
import {YT_URLS} from "../../utils/ytdl-constants";
import {AppManager} from "../../services/request-handler/app-manager.service";
import {ToolsDialog} from "../../components/tools-dialog/tools-dialog.component";
import {ModalController, Platform} from "@ionic/angular";
import {IntentService} from "../../services/intent/intent.service";
import {MatMenu} from "@angular/material/menu";
import {SettingsService} from "../../services/settings/settings.service";
import {UtilsService} from "../../services/utils/utils.service";
import {forkJoin, fromEvent} from "rxjs";
import {debounceTime, tap} from "rxjs/operators";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

    @ViewChild('fileInput', {static: false}) fileInput: any;
    selectedFiles: any[] = [];

    @ViewChild('filterInput', {static: false}) filterInput: any;

    @ViewChild("mainMenu", {read: MatMenu, static: false})
    public menu: MatMenu;

    @ViewChild(FileStatusTableComponent, {static: false})
    fileStatusTable: FileStatusTableComponent;

    displayedColumns: string[] = ['select', 'name', 'status', 'startDate'];

    urlFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern("^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$")
    ]);

    playlistContent: string | ArrayBuffer = "";

    constructor(private platform: Platform,
                private intentService: IntentService,
                private settingsService: SettingsService,
                public utilsService: UtilsService,
                public appManager: AppManager,
                private dialog: MatDialog,
                private modalController: ModalController) {
    }


    ngOnInit() {
        this.platform.ready().then(() => {
            this.urlFormControl.setValue(YT_URLS.Playlist_Test);
            this.displayedColumns = this.settingsService.getDisplayedColumns().split("|");

            this.intentService.onIntentReceived = (url) => {
                this.urlFormControl.setValue(url);
                this.appManager.sendConvertRequest(this.urlFormControl.value);
            };
            this.intentService.init();

            this.appManager.onFilesStatusUpdated.subscribe(fs => this.refreshTable(fs));
        });
    }

    ngAfterViewInit() {
        fromEvent(this.filterInput.nativeElement, 'keyup')
            .pipe(debounceTime(400), tap(e => this.refreshTable()))
            .subscribe();
    }


    //#region Menu

    public uploadActionClicked() {
        this.fileInput.nativeElement.click();
    }

    public updateDisplayedColumns(value: string) {
        this.displayedColumns.includes(value)
            ? this.displayedColumns = this.displayedColumns.filter(c => c !== value)
            : this.displayedColumns.push(value);

        this.settingsService.setDisplayedColumns(
            this.displayedColumns.join('|')
        );
    }

    public refreshActionClicked() {
        this.fileStatusTable.resetSelection();
        this.appManager.runAutomaticUpdate();
    }

    public settingsActionClicked() {
        this.openSettingsDialog();
    }

    // #endregion

    //#region Upload

    /** After file loaded **/
    onFileChange(event) {
        if (event.target.files.length != 1 ||
            !event.target.files[0].type ||
            event.target.files[0].type != 'application/x-mpegurl') {
            this.utilsService.showToast("Invalid file, only m3u8 files allowed");
            return;
        }

        this.selectedFiles = [];
        for (const file of event.target.files) this.selectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = () => this.playlistContent = reader.result;
        reader.onerror = e => this.utilsService.showToast('Error when reading file: ' + e);
        reader.readAsText(event.target.files[0]);
    }

    // #endregion

    //#region Buttons

    public convertButtonClicked() {
        if (this.urlFormControl.invalid) return;
        this.appManager.sendConvertRequest(this.urlFormControl.value);
    }

    public downloadButtonClicked() {
        const selectedItems: FileStatus[] = this.fileStatusTable.getSelected().filter(fs => fs.status == "COMPLETED");

        if (selectedItems.length < 1) {
            alert("No files selected. Files should be in « COMPLETED » status to be downloaded");
            return;
        }

        const ids: string[] = selectedItems.map(fs => fs.id);

        // Download only one file
        if (ids.length == 1) this.appManager.sendDownloadRequest(ids[0]);

        // Download file as zip
        else this.appManager.sendDownloadAsZipRequest(ids);
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
        switch (event) {
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
            this.appManager.sendTagRequest(result.id, result.name, result.metadata)
                .subscribe(() => this.refresh());
        });
    }

    private openPostProcessorDialog(selectedItems: FileStatus[]): void {
        const dialogRef = this.dialog.open(ToolsDialog, {data: {fileStatus: selectedItems}});
        dialogRef.afterClosed().subscribe((result: FileStatus[]) => {
            if (!result) return;
            forkJoin(result.map(fs => this.appManager.sendTagRequest(fs.id, fs.name, fs.metadata)))
                .subscribe(() => this.refresh());
        });
    }

    private async openSettingsDialog(): Promise<void> {
        const modal = await this.modalController.create({
            component: SettingsDialog,
            cssClass: 'settings-dialog'
        });
        modal.onDidDismiss().then(_ => this.appManager.getSettings());
        return modal.present();
    }

    private refresh() {
        this.appManager.sendUpdateRequest().subscribe(fs => this.refreshTable(fs));
    }

    private refreshTable(fs?: FileStatus[]): void {
        if (!fs) fs = this.appManager.filesStatus;
        this.fileStatusTable.refreshDataTable(
            fs.filter(f => f.name.includes(this.filterInput.nativeElement.value))
        );
    }
}
