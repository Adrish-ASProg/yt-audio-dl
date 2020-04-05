import {Injectable} from '@angular/core';
import {YTDLUtils} from "../../utils/ytdl-utils";
import {Mp3Metadata} from "../../model/mp3metadata.model";
import {APIService, UploadData} from "../api/api.service";
import {interval, Observable, Subject, Subscription} from "rxjs";
import {flatMap} from "rxjs/operators";
import {FileStatus} from "../../model/filestatus.model";
import {SettingsService} from "../settings/settings.service";
import {AppManagerModule} from "./app-manager.module";
import {ModalController, Platform} from "@ionic/angular";
import {FileTransferService} from "../file-transfer/file-transfer.service";
import {HttpErrorResponse, HttpEvent, HttpEventType, HttpResponse} from "@angular/common/http";
import {LoadingService} from "../loading/loading.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {File} from '@ionic-native/file/ngx';
import {TransferItem, TransferService, TransferStatus} from "../transfer/transfer.service";
import {UtilsService} from "../utils/utils.service";

@Injectable({providedIn: AppManagerModule})
export class AppManager {

    filesStatus: FileStatus[] = [];
    onFilesStatusUpdated: Subject<FileStatus[]> = new Subject<FileStatus[]>();

    refreshRate: number = 3000;
    isServerOn: boolean = false;

    isAutoUpdateRunning: boolean = false;
    autoUpdateObservable: Subscription;

    constructor(private file: File,
                private platform: Platform,
                private snackBar: MatSnackBar,
                private apiService: APIService,
                private utilsService: UtilsService,
                private loadingService: LoadingService,
                private settingsService: SettingsService,
                private transferService: TransferService,
                private modalController: ModalController,
                private fileTransferService: FileTransferService) {

        // Send first update immediately
        this.sendUpdateRequest().subscribe(fs => this.onUpdateReceived(fs));

        this.getSettings();
    }

    getSettings(): void {
        this.refreshRate = this.settingsService.getRefreshRate();
        this.runAutomaticUpdate();
    }

    runAutomaticUpdate() {
        this.sendUpdateRequest().subscribe(filesStatus => this.onUpdateReceived(filesStatus));
        if (this.autoUpdateObservable) this.autoUpdateObservable.unsubscribe();

        // Send update request at <refreshRate> interval
        this.autoUpdateObservable = interval(this.refreshRate)
            .pipe(flatMap(() => this.sendUpdateRequest()))
            .subscribe(filesStatus => this.onUpdateReceived(filesStatus),
                response => {
                    this.isServerOn = false;
                    console.error("Unable to retrieve files status from server, stopping automatic updates.", response.error);
                    if (response.error != void 0 && response.error.message != void 0)
                        alert(response.error.message);
                });

    }

    onUpdateReceived(filesStatus: FileStatus[]): void {
        this.isServerOn = true;

        // Remove old file status
        this.filesStatus = this.filesStatus.filter(fs => filesStatus.find(f => f.id === fs.id));

        // Add / Edit each filestatus rather than replace them (deal with reference issues)
        filesStatus.forEach(fs => {
            const oldFileStatus = this.filesStatus.find(f => f.id === fs.id);
            if (oldFileStatus) {
                oldFileStatus.name = fs.name;
                oldFileStatus.metadata = fs.metadata;
                oldFileStatus.startDate = fs.startDate;
                oldFileStatus.status = fs.status;
            } else this.filesStatus.push(fs);
        });

        this.onFilesStatusUpdated.next(this.filesStatus);
    }


    //#region Send_xxx_Request

    public async sendUploadRequest(files: any[], handleMissingFiles: boolean) {
        this.utilsService.showTransferModal()
            .then(_ => files.forEach(file => this.uploadFile(file.name, file, handleMissingFiles)));
    }

    async sendConvertRequest(request: string) {
        await this.loadingService.showDialog("Retrieving title(s)..");
        this.apiService.requestConvert(request)
            .subscribe(
                () => {
                    this.loadingService.dismissDialog();
                    this.sendUpdateRequest();
                },
                response => {
                    this.loadingService.dismissDialog();
                    console.error(response.error);
                    alert(response.error.message);
                }
            );
    }

    sendUpdateRequest(): Observable<FileStatus[]> {
        return this.apiService.getAllFileStatus();
    }

    async sendDownloadRequest(id: string) {
        await this.loadingService.showDialog("Downloading file..");

        this.apiService.downloadFile(id).subscribe(
            async (response: HttpResponse<any>) => {
                await this.loadingService.showDialog("Saving file as " + response.headers.get('FileName'));

                this.handleBlobDownload(response.body, response.headers.get('FileName'), 'audio/mpeg')
                    .then(_ => this.handleSaveSuccess(), error => this.handleSaveError(error));
            },
            error => this.handleDownloadError(error)
        );
    }

    async sendDownloadAsZipRequest(ids: string[]) {
        await this.loadingService.showDialog("Downloading file..");

        this.apiService.downloadFilesAsZip(ids).subscribe(
            async (response: HttpResponse<any>) => {
                await this.loadingService.showDialog("Saving file as yt-audio-dl.zip");

                this.handleBlobDownload(response.body, 'yt-audio-dl.zip', 'application/zip')
                    .then(_ => this.handleSaveSuccess(), error => this.handleSaveError(error));
            },
            error => this.handleDownloadError(error)
        );
    }

    sendDeleteRequest(ids: string[]): void {
        this.apiService.deleteFiles(ids)
            .subscribe(
                (result: boolean) => {
                    if (!result) alert("An error occurred while trying to delete files, some files may not have been deleted");
                },
                error => {
                    alert("An error occurred while trying to delete files");
                    console.error(error);
                })
    }

    sendTagRequest(id: string, name: string, metadata: Mp3Metadata): Observable<Mp3Metadata> {
        return this.apiService.setTags(id, name, metadata);
    }

    // #endregion


    //#region YT-dl

    handleBlobDownload(blob: Blob, filename: string, mimeType: 'audio/mpeg' | 'application/zip'): Promise<any> {
        // It is necessary to create a new blob object with mime-type explicitly set
        // otherwise only Chrome works like it should
        const newBlob = new Blob([blob], {type: mimeType});

        if (this.platform.is('cordova')) {
            return this.fileTransferService.writeBlobToStorage(newBlob, filename);
        } else {
            YTDLUtils.saveBlobToStorage(newBlob, filename);
            return new Promise(r => r());
        }
    }

    handleDownloadError(error) {
        this.loadingService.dismissDialog();
        alert(`Error ${error.status} when downloading file: ${error.statusText}`);
        if (error.error instanceof Blob) YTDLUtils.parseErrorBlob(error.error).subscribe(e => alert(e.message));
    }

    handleSaveError(error) {
        this.loadingService.dismissDialog();
        alert(`Error ${error.status} when saving file: ${error.statusText}`);
    }

    handleSaveSuccess() {
        this.loadingService.dismissDialog();
        this.snackBar.open("File downloaded successfully", "Hide", {duration: 1500});
    }

    // #endregion


    //#region Playlist

    private uploadFile(fileName: string, blob: Blob, handleMissingFiles: boolean = false) {
        const formData: FormData = new FormData();
        formData.append('file', blob, fileName);
        formData.append('handleMissingFiles', `${handleMissingFiles}`);

        const callback = handleMissingFiles ? result => this.handleMissingFilesResponse(result.body) : undefined;
        const uploadData = new UploadData(fileName, formData, callback);
        this.createTransferAndUpload(uploadData);
    }


    // Handle missing files by uploading them if needed
    private handleMissingFilesResponse(response) {
        if (!response || !response.missingFiles || !(response.missingFiles.length > 0)) return;

        if (!this.platform.is('cordova')) {
            console.error("Unable to read file from filesystem on non-cordova platform");
            this.utilsService.showToast("Unable to read file from filesystem on non-cordova platform");
            return;
        }

        let processedFiles: number = 0;
        response.missingFiles.forEach(missingFile => {
            this.transferService.showMessage(`Reading missing files.. (${processedFiles} / ${response.missingFiles.length})`);

            const temp = missingFile.split('/');
            const fileName = temp.pop();
            const filePath = `file://${temp.join('/')}/`;

            // Read files
            this.file.readAsArrayBuffer(filePath, fileName)
                .then(fileArrayBuffer => {
                    // Read OK
                    if (fileArrayBuffer != void 0 && fileArrayBuffer.byteLength > 0)
                        this.uploadFile(fileName, new Blob([fileArrayBuffer], {type: 'audio/mpeg'}));

                    // Read KO
                    else this.transferService.addErroredTransfer(fileName, 'Empty file');
                })
                .catch(reason => {
                    console.error('Failed to read file ' + missingFile, reason);
                    this.transferService.addErroredTransfer(fileName, 'Unable to find file or to get filesystem access');
                })
                .finally(() => {
                    this.transferService.showMessage(`Reading missing files.. (${++processedFiles} / ${response.missingFiles.length})`);
                    if (processedFiles === response.missingFiles.length) this.transferService.hideMessage();
                });
        });
    }


    private createTransferAndUpload(uploadData: UploadData): void {
        // Create TransferItem
        const pendingTransfer = new TransferItem(`Uploading ${uploadData.fileName}`, TransferStatus.PENDING, undefined);
        this.transferService.addTransfer(pendingTransfer);

        const onUploadSuccess = (event: HttpEvent<any>) => {
            pendingTransfer.setLabel(`${uploadData.fileName}`);

            switch (event.type) {

                case HttpEventType.UploadProgress:
                    pendingTransfer.setProgress(Math.round(100 * event.loaded / event.total));
                    break;

                case HttpEventType.Response:
                    pendingTransfer.setCompleted();
                    if (uploadData.onFinishedCallback)
                        uploadData.onFinishedCallback({type: HttpEventType.Response, status: event.status, body: event.body});
                    break;

                default:
                    return {type: event.type};
            }
        };
        const onUploadError = (error: HttpErrorResponse) => {
            pendingTransfer.setError(
                (error.statusText === 'Unknown Error' || error.error == void 0) ? 'Unknown Error' : error.error
            );

            console.error(`Error uploading ${uploadData.fileName}`, error);
        };

        this.apiService.uploadFile(uploadData.formData).subscribe(next => onUploadSuccess(next), error => onUploadError(error));
    }

    // #endregion
}
