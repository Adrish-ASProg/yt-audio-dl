import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from "@angular/material/dialog";
import {Platform} from "@ionic/angular";
import {debounceTime, tap} from "rxjs/operators";
import {forkJoin, fromEvent} from "rxjs";
import {YT_URLS} from "../../utils/ytdl-constants";
import {IntentService} from "../../services/intent/intent.service";
import {AppManager} from "../../services/request-handler/app-manager.service";
import {FileStatus} from "../../model/filestatus.model";
import {FileStatusTableComponent} from "../../components/file-status-table/file-status-table.component";
import {TagEditorDialog} from "../../components/tag-editor-dialog/tag-editor-dialog.component";
import {YTDLUtils} from "../../utils/ytdl-utils";
import {ToolsDialog} from "../../components/tools-dialog/tools-dialog.component";
import {AudioPlayerService} from "../../services/audio/audio-player.service";
import {FileSelectDialog} from "../../components/file-select-dialog/file-select-dialog.component";

@Component({
    selector: 'app-download-tab',
    templateUrl: './download.tab.html',
    styleUrls: ['./download.tab.scss'],
})
export class DownloadTab implements OnInit, AfterViewInit {

    urlFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern("^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$")
    ]);

    @ViewChild('filterInput') filterInput: any;
    filterInputValue: string = "";

    @ViewChild(FileStatusTableComponent)
    fileStatusTable: FileStatusTableComponent;

    @Input() displayedColumns: string[] = [];

    selectFilesToDl: boolean = true;

    constructor(private appManager: AppManager,
                private audioPlayerService: AudioPlayerService,
                private dialog: MatDialog,
                private intentService: IntentService,
                private platform: Platform,
                private route: ActivatedRoute) {
    }

    //#region Init

    ngOnInit() {
        this.platform.ready().then(() => {
            this.setInitialUrl();

            this.intentService.onIntentReceived = (url) => {
                this.setUrl(url);
                this.convertButtonClicked();
            };
            this.intentService.init();
        });
    }

    ngAfterViewInit() {
        fromEvent(this.filterInput.nativeElement, 'keyup')
            .pipe(debounceTime(500), tap(e => this.refresh()))
            .subscribe();
    }

    setInitialUrl() {
        this.setUrl(YT_URLS.Video_Test);

        this.route.queryParams.subscribe(params => {
            const id = params["id"];

            if (id != undefined) {
                const urlPath = id.length === 11 ? `watch?v=${id}` : `playlist?list=${id}`;
                this.setUrl(`https://www.youtube.com/${urlPath}`);
                this.convertButtonClicked();
                return;
            }
        });
    }

    // #endregion

    //#region Buttons

    public convertButtonClicked() {
        if (this.urlFormControl.invalid) return;

        this.appManager.sendConvertRequest(this.urlFormControl.value, this.selectFilesToDl)
            .subscribe(data => {
                if (data) this.handleFileSelection(data);
                this.refresh();
            });
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

        this.appManager.sendDeleteRequest(selectedItems.map(fileStatus => fileStatus.id))
            .subscribe(
                (result: boolean) => {
                    if (!result) alert("An error occurred while trying to delete files, some files may not have been deleted");
                },
                error => {
                    alert("An error occurred while trying to delete files:\n" + error.error.message);
                    console.error(error);
                },
                () => this.refresh());
    }

    public playButtonClicked(selectedItem: FileStatus) {
        this.audioPlayerService.playSong(selectedItem.id);
    }

    // #endregion

    public getSelectedFiles(): FileStatus[] {
        return this.fileStatusTable.getSelected();
    }

    public hasFileSelected(): boolean {
        return this.fileStatusTable.getSelected()?.length > 0;
    }

    public setUrl(url: string) {
        this.urlFormControl.setValue(url);
    }

    public openTagEditorDialog(event): void {
        const dialogRef = this.dialog.open(TagEditorDialog, {data: YTDLUtils.copyObject(event)});
        dialogRef.afterClosed().subscribe(result => {
            if (!result) return;
            this.appManager.sendTagRequest(result.id, result.name, result.metadata)
                .subscribe(() => this.refresh());
        });
    }

    public refresh() {
        this.fileStatusTable.refreshTableData();
    }

    private openPostProcessorDialog(selectedItems: FileStatus[]): void {
        const dialogRef = this.dialog.open(ToolsDialog, {data: {fileStatus: selectedItems}});
        dialogRef.afterClosed().subscribe((result: FileStatus[]) => {
            if (!result) return;
            forkJoin(result.map(fs => this.appManager.sendTagRequest(fs.id, fs.name, fs.metadata)))
                .subscribe(() => this.refresh());
        });
    }

    private handleFileSelection(data: any) {
        const dialogRef = this.dialog.open(FileSelectDialog, {data});

        dialogRef.afterClosed().subscribe(result => {
            if (!result) return;

            this.appManager.sendConvertByIdRequest(result)
                .subscribe(() => this.refresh());
        });
    }
}
