import {Component, OnInit, ViewChild} from '@angular/core';
import {APIService} from "./service/api.service";
import {ConvertRequest} from "./model/convertrequest.model";
import {FileStatus} from "./model/filestatus.model";
import {MatPaginator, MatSort, MatTableDataSource} from "@angular/material";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    // Toolbar
    projectTitle: string = 'yt-audio-dl';

    // Table File Status
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) sort: MatSort;

    displayedColumns: string[] = ['uuid', 'name', 'status', 'startDate', 'download'];
    fileStatus: FileStatus[] = [];
    dataSource = new MatTableDataSource<FileStatus>(this.fileStatus);

    refreshRate: number = 3000;
    intervalId: number;


    request: ConvertRequest = {
        url: "https://www.youtube.com/watch?v=zhsfn9IyiLQ",
        audioOnly: true
    };


    constructor(public apiService: APIService) {}

    ngOnInit() {
        this.getFileStatus();
        this.intervalId = setInterval(() => { this.getFileStatus() }, this.refreshRate);
    }

    sendConvertRequest() {
        this.apiService.requestConvert(this.request)
            .subscribe(uuid => { this.getFileStatus(); });
    }

    sendDownloadRequest(uuid: string) {
        this.apiService.downloadFile(uuid)
            .subscribe(response => this.saveFile(response));
    }

    saveFile(response) {
        console.log(response);
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

    getFileStatus() {
        this.updateRefreshLoop();

        this.apiService.getAllFileStatus()
            .subscribe(filesStatus => {
                this.fileStatus = [...filesStatus];

                this.dataSource = new MatTableDataSource(this.fileStatus);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            });
    }

    updateRefreshLoop() {
        clearInterval(this.intervalId);
        this.intervalId = setInterval(() => { this.getFileStatus() }, this.refreshRate);
    }
}
