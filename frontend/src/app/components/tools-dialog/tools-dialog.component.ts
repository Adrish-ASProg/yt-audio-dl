import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FileStatus} from "../../model/filestatus.model";
import {YTDLUtils} from "../../utils/ytdl-utils";
import {Mp3Metadata} from "../../model/mp3metadata.model";

interface Format {
    label: string;
    pattern: { album?: number, artist?: number, genre?: number, title?: number };
    regex: string;
}

@Component({
    selector: 'app-tools-dialog',
    templateUrl: './tools-dialog.component.html',
    styleUrls: ['./tools-dialog.component.scss']
})
export class ToolsDialog {

    formats: Format[] = [
        {label: 'artist - title', pattern: {artist: 1, title: 2}, regex: "(.*?) - (.*)"},
        {label: 'album - title', pattern: {album: 1, title: 2}, regex: "(.*?) - (.*)"},
        {label: 'artist - title - album', pattern: {artist: 1, title: 2, album: 3}, regex: "(.*?) - (.*?) - (.*)"},
        {label: 'artist - album - title', pattern: {artist: 1, album: 2, title: 3}, regex: "(.*?) - (.*?) - (.*)"}
    ];
    selectedFormat: Format;

    resultItems: FileStatus[] = [];
    exampleItem: FileStatus;

    constructor(private dialogRef: MatDialogRef<ToolsDialog>,
                @Inject(MAT_DIALOG_DATA) public data: { fileStatus: FileStatus[] }) {

        if (!data.fileStatus || data.fileStatus.length < 1) return;
        this.exampleItem = YTDLUtils.copyObject(data.fileStatus[0]);
    }

    updateTableResults(format: Format) {
        this.selectedFormat = format;
        if (this.selectedFormat) {
            const metadata: Mp3Metadata = this.setTagsFromName(this.data.fileStatus[0], this.selectedFormat);
            this.exampleItem.metadata.album = metadata.album;
            this.exampleItem.metadata.artist = metadata.artist;
            this.exampleItem.metadata.genre = metadata.genre;
            this.exampleItem.metadata.title = metadata.title;
        }
    }

    setTagsFromName(filestatus: FileStatus, format: Format): Mp3Metadata {
        const metadata: Mp3Metadata = YTDLUtils.copyObject(filestatus.metadata);
        try {
            const match = filestatus.name.match(new RegExp(format.regex, ""));

            if (format.pattern.album && match.length > format.pattern.album)
                metadata.album = match[format.pattern.album];

            if (format.pattern.artist && match.length > format.pattern.artist)
                metadata.artist = match[format.pattern.artist];

            if (format.pattern.genre && match.length > format.pattern.genre)
                metadata.genre = match[format.pattern.genre];

            if (format.pattern.title && match.length > format.pattern.title)
                metadata.title = match[format.pattern.title];

        } catch (e) {}

        return metadata;
    }


    validate() {
        if (this.selectedFormat) {
            this.data.fileStatus.forEach(file => {
                const metadata: Mp3Metadata = this.setTagsFromName(file, this.selectedFormat);

                const fs: FileStatus = YTDLUtils.copyObject(file);
                fs.metadata.album = metadata.album;
                fs.metadata.artist = metadata.artist;
                fs.metadata.genre = metadata.genre;
                fs.metadata.title = metadata.title;
                this.resultItems.push(fs);
            });
        }
    }

    //#region Buttons

    onValidButtonClicked(): void {
        this.validate();
        this.dialogRef.close(this.resultItems);
    }

    onCancelButtonClicked(): void { this.dialogRef.close(); }

    // #endregion
}
