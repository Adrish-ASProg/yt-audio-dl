import {Component, OnInit} from '@angular/core';
import {APIService} from "./service/api.service";
import {ConvertRequest} from "./model/convertrequest.model";
import {FileStatus} from "./model/filestatus.model";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    // Toolbar
    projectTitle: string = 'yt-audio-dl';

    displayedColumns: string[] = ['uuid', 'name', 'status', 'startDate', 'download', 'refresh'];
    filesStatus: FileStatus[] = [];

    refreshRate: number = 3000;
    intervalId: number;

    request: ConvertRequest = {
        url: "https://www.youtube.com/watch?v=zhsfn9IyiLQ",
        audioOnly: true
    };


    constructor(public apiService: APIService) {}

    ngOnInit() { this.sendUpdateRequest(); }


    sendConvertRequest() {
        this.apiService.requestConvert(this.request)
            .subscribe(uuid => { this.sendUpdateRequest(); });
    }

    sendUpdateRequest() {
        this.updateRefreshLoop();

        this.apiService.getAllFileStatus()
            .subscribe(filesStatus => this.filesStatus = [...filesStatus]);
    }

    sendDownloadRequest(uuid: string) {
        this.apiService.downloadFile(uuid)
            .subscribe(response => this.saveFile(response));
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

    updateRefreshLoop() {
        if (this.intervalId != void 0) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => { this.sendUpdateRequest() }, this.refreshRate);
    }
}
