import {Component, Inject} from '@angular/core';
import {HttpResponse} from "@angular/common/http";

import {Platform} from "@ionic/angular";

import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FileStatus} from "../../model/filestatus.model";
import {YTDLUtils} from "../../utils/ytdl-utils";
import {Mp3Metadata} from "../../model/mp3metadata.model";
import {SettingsService} from "../../services/settings/settings.service";
import {APIService} from "../../services/api/api.service";
import {FileTransferService} from "../../services/file-transfer/file-transfer.service";
import {MatSnackBar} from "@angular/material/snack-bar";

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

    filePath: string = "";


    //#region Filename to tags

    formats: Format[] = [
        {label: 'artist - title', pattern: {artist: 1, title: 2}, regex: "(.*?) - (.*)"},
        {label: 'album - title', pattern: {album: 1, title: 2}, regex: "(.*?) - (.*)"},
        {label: 'artist - title - album', pattern: {artist: 1, title: 2, album: 3}, regex: "(.*?) - (.*?) - (.*)"},
        {label: 'artist - album - title', pattern: {artist: 1, album: 2, title: 3}, regex: "(.*?) - (.*?) - (.*)"}
    ];
    selectedFormat: Format;

    resultItems: FileStatus[] = [];
    exampleItem: FileStatus;

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
    savedFolders: string[] = [];

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

    // #endregion


    //#region Playlist creator

    constructor(private dialogRef: MatDialogRef<ToolsDialog>,
                private platform: Platform,
                private snackBar: MatSnackBar,
                private apiService: APIService,
                private settings: SettingsService,
                private fileTransferService: FileTransferService,
                @Inject(MAT_DIALOG_DATA) public data: { fileStatus: FileStatus[] }) {

        if (!data.fileStatus || data.fileStatus.length < 1) return;
        this.exampleItem = YTDLUtils.copyObject(data.fileStatus[0]);
        this.savedFolders = settings.getSavedFolders().split("|").filter(s => s != "");
    }

    onApplyButtonClicked(): void {
        this.validate();
        this.dialogRef.close(this.resultItems);
    }

    onDownloadPlaylistButtonClicked(): void {
        if (!this.filePath) return;

        this.apiService.downloadPlaylist(this.data.fileStatus.map(fs => fs.id), this.filePath)
            .subscribe((response: HttpResponse<any>) => {

                const blob = new Blob([response.body], {type: "text/plain"});

                if (this.platform.is('cordova')) {
                    this.fileTransferService.writeBlobToStorage(blob, "yt-audio-dl.m3u8")
                        .then(
                            _ => this.snackBar.open("File downloaded successfully", "Hide", {duration: 1500}),
                            _ => this.snackBar.open("Error downloading file", "Hide", {duration: 1500})
                        );
                } else {
                    YTDLUtils.saveBlobToStorage(blob, "yt-audio-dl.m3u8");
                    this.snackBar.open("File downloaded successfully", "Hide", {duration: 1500});
                }
            });
    }

    // #endregion


    onCloseButtonClicked(): void { this.dialogRef.close(); }
}
