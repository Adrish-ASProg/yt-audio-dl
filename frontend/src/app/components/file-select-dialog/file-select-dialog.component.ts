import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {VideoInfo} from "../../model/videoinfo.model";

@Component({
    selector: 'app-file-select-dialog',
    templateUrl: './file-select-dialog.component.html',
    styleUrls: ['./file-select-dialog.component.scss']
})
export class FileSelectDialog {

    videosInfo: VideoInfo[] = [];
    selectedVideosInfo: VideoInfo[] = [];

    constructor(private dialogRef: MatDialogRef<FileSelectDialog>,
                @Inject(MAT_DIALOG_DATA) public data: VideoInfo[]) {

        this.videosInfo = data;
    }

    onValidButtonClicked(): void {
        this.dialogRef.close(this.selectedVideosInfo);
    }

    onCancelButtonClicked(): void {
        this.dialogRef.close();
    }
}
