import {Component, OnInit, ViewChild} from '@angular/core';
import {UtilsService} from "../../services/utils/utils.service";
import {AppManager} from "../../services/request-handler/app-manager.service";

@Component({
    selector: 'app-upload-tab',
    templateUrl: './upload.tab.html',
    styleUrls: ['./upload.tab.scss'],
})
export class UploadTab implements OnInit {

    @ViewChild('fileInput') fileInput: any;
    selectedFiles: any[] = [];

    playlistContent: string | ArrayBuffer = "";

    constructor(private appManager: AppManager,
                private utilsService: UtilsService) {
    }

    ngOnInit() {
    }

    public selectPlaylistBtnClicked() {
        this.fileInput.nativeElement.click();
    }

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
}
