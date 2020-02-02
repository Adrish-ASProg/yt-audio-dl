import {Component, OnInit, ViewChild} from '@angular/core';
import {TagEditorDialog} from "../../components/tag-editor-dialog/tag-editor-dialog.component";
import {Utils} from "../../utils/utils";
import {Mp3Metadata} from "../../model/mp3metadata.model";
import {ActivatedRoute} from "@angular/router";
import {APIService} from "../../services/api/api.service";
import {MatDialog} from "@angular/material/dialog";
import {FileStatusTableComponent} from "../../components/file-status-table/file-status-table.component";
import {FileStatus} from "../../model/filestatus.model";
import {ConvertRequest} from "../../model/convertrequest.model";
import {FormControl, Validators} from "@angular/forms";
import {SettingsDialog} from "../../components/settings-dialog/settings-dialog.component";
import {SettingsService} from "../../services/settings/settings.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    menu: any = [
        {label: "Refresh", action: () => this.refreshButtonClicked()},
        {label: "Delete", action: () => this.deleteButtonClicked()}
    ];

    @ViewChild(FileStatusTableComponent, {static: false})
    fileStatusTable: FileStatusTableComponent;

    displayedColumns: string[] = ['select', 'name', 'status', 'startDate', 'download'];
    filesStatus: FileStatus[] = [];

    refreshRate: number = 3000;
    intervalId: number;

    request: ConvertRequest = {
        url: "https://www.youtube.com/playlist?list=PL0-adpj8Oy0lqSmQVOrj9q_Q5CR0jIuUE",
        // url: "https://www.youtube.com/watch?v=zhsfn9IyiLQ",
        audioOnly: true
    };

    urlFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern("^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$")
    ]);

    constructor(private route: ActivatedRoute,
                private apiService: APIService,
                private dialog: MatDialog) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const videoId = params["videoId"];
            if (videoId == void 0) return;

            if (videoId.length === 11) {
                this.request.url = `https://www.youtube.com/watch?v=${videoId}`;
                this.sendConvertRequest();
            }
        });
        this.sendUpdateRequest();
    }

    //#region Menu

    public getMenu() { return this.menu; }

    public refreshButtonClicked() {
        this.sendUpdateRequest();
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

        this.sendDeleteRequest(this.fileStatusTable.getSelected().map(fileStatus => fileStatus.uuid));
    }

    // #endregion

    //#region Send_xxx_Requests methods

    sendConvertRequest() {
        if (this.urlFormControl.invalid) return;

        this.apiService.requestConvert(this.request)
            .subscribe(
                () => this.sendUpdateRequest(),
                response => {
                    console.error(response.error);
                    alert(response.error.message);
                }
            );
    }

    sendUpdateRequest() {
        this.updateRefreshLoop();

        this.apiService.getAllFileStatus()
            .subscribe(
                filesStatus => {
                    // Remove old file status
                    this.filesStatus = this.filesStatus.filter(fs => filesStatus.find(f => f.uuid === fs.uuid));

                    // Add / Edit
                    filesStatus.forEach(fs => {
                        const oldFileStatus = this.filesStatus.find(f => f.uuid === fs.uuid);
                        if (oldFileStatus) {
                            oldFileStatus.name = fs.name;
                            oldFileStatus.metadata = fs.metadata;
                            oldFileStatus.startDate = fs.startDate;
                            oldFileStatus.status = fs.status;
                        } else this.filesStatus.push(fs);
                    });

                    this.fileStatusTable.refreshDataTable(this.filesStatus);
                },
                response => {
                    console.error(response.error);
                    if (response.error != void 0 && response.error.message != void 0)
                        alert(response.error.message);
                }
            );
    }

    sendDownloadRequest(uuid: string) {
        this.apiService.downloadFile(uuid)
            .subscribe(
                response => Utils.saveFileFromServerResponse(response),
                response => {
                    Utils.parseErrorBlob(response)
                        .subscribe(e => alert(e.message));
                }
            );
    }

    sendDeleteRequest(uuids: string[]) {
        this.apiService.deleteFiles(uuids)
            .subscribe(
                (result: boolean) => {
                    if (!result) alert("An error occurred while trying to delete files, some files may not have been deleted");
                },
                error => {
                    alert("An error occurred while trying to delete files");
                    console.error(error);
                })
    }

    sendTagRequest(uuid: string, name: string, metadata: Mp3Metadata) {
        this.apiService.setTags(uuid, name, metadata).subscribe();
    }

    // #endregion

    openTagEditorDialog(event): void {
        const dialogRef = this.dialog.open(TagEditorDialog, {data: event});
        dialogRef.afterClosed().subscribe(result => {
            if (result) this.sendTagRequest(result.uuid, result.name, result.metadata);
        });
    }

    updateRefreshLoop() {
        if (this.intervalId != void 0) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => this.sendUpdateRequest(), this.refreshRate);
    }
}
