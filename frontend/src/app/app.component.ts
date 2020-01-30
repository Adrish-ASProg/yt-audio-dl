import {Component, OnInit, ViewChild} from '@angular/core';
import {APIService} from "./service/api.service";
import {ConvertRequest} from "./model/convertrequest.model";
import {FileStatus} from "./model/filestatus.model";
import {Observable, Observer} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {ActivatedRoute} from "@angular/router";
import {TagEditorDialog} from "./components/tag-editor-dialog/tag-editor-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {Mp3Metadata} from "./model/mp3metadata.model";
import {FileStatusTableComponent} from "./components/file-status-table/file-status-table.component";
import {YTDLUtils} from "./utils/ytdl-utils";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    @ViewChild(FileStatusTableComponent, {static: false})
    fileStatusTable: FileStatusTableComponent;

    // Toolbar
    projectTitle: string = 'yt-audio-dl';

    displayedColumns: string[] = ['select', 'name', 'status', 'startDate', 'download'];
    filesStatus: FileStatus[] = [];

    refreshRate: number = 3000;
    intervalId: number;

    request: ConvertRequest = {
        url: "https://www.youtube.com/playlist?list=PL0-adpj8Oy0lqSmQVOrj9q_Q5CR0jIuUE",
        // url: "https://www.youtube.com/watch?v=zhsfn9IyiLQ",
        audioOnly: true
    };


    constructor(private route: ActivatedRoute,
                private apiService: APIService,
                private dialog: MatDialog) {
    }

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


    sendConvertRequest() {
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
                        }
                        else this.filesStatus.push(fs);
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
                response => this.saveFile(response),
                response => {
                    this.parseErrorBlob(response)
                        .subscribe(e => alert(e.message));
                }
            );
    }

    sendTagRequest(uuid: string, metadata: Mp3Metadata) {
        this.apiService.setTags(uuid, metadata).subscribe();
    }

    updateRefreshLoop() {
        if (this.intervalId != void 0) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => this.sendUpdateRequest(), this.refreshRate);
    }


    openTagEditorDialog(event): void {
        const dialogRef = this.dialog.open(TagEditorDialog, {data: YTDLUtils.copyObject(event)});
        dialogRef.afterClosed().subscribe(result => {
            if (result) this.sendTagRequest(result.uuid, result.metadata)
        });
    }

    //#region Menu

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

        this.apiService.deleteFiles(
            this.fileStatusTable.getSelected().map(fileStatus => fileStatus.uuid)
        ).subscribe()
    }


    // #endregion

    setUrl(event) {
        console.log(event);
        switch (event.value) {
            case "bg":
                this.request.url = "https://www.youtube.com/playlist?list=PL0-adpj8Oy0mdpClLbg-tIFMxWBVtifXc";
                break;

            case "test":
                this.request.url = "https://www.youtube.com/playlist?list=PL0-adpj8Oy0lqSmQVOrj9q_Q5CR0jIuUE";
                break;

            case "video":
            default:
                this.request.url = "https://www.youtube.com/watch?v=zhsfn9IyiLQ";
                break;
        }
    }

    saveFile(response) {
        // It is necessary to create a new blob object with mime-type explicitly set
        // otherwise only Chrome works like it should
        const newBlob = new Blob([response.body], {type: "audio/mpeg"});

        // IE doesn't allow using a blob object directly as link href
        // instead it is necessary to use msSaveOrOpenBlob
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(newBlob);
            return;
        }

        // For other browsers:
        // Create a link pointing to the ObjectURL containing the blob.
        const data = window.URL.createObjectURL(newBlob);
        const link = document.createElement('a');
        link.href = data;
        link.download = response.headers.get('FileName');
        // this is necessary as link.click() does not work on the latest firefox
        link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));

        setTimeout(function () {
            // For Firefox it is necessary to delay revoking the ObjectURL
            window.URL.revokeObjectURL(data);
            link.remove();
        }, 100);
    }

    parseErrorBlob(err: HttpErrorResponse): Observable<any> {
        const reader: FileReader = new FileReader();

        const obs = new Observable((observer: Observer<any>) => {
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    observer.next(JSON.parse(reader.result));
                }
                observer.complete();
            }
        });
        reader.readAsText(err.error);
        return obs;
    }
}
