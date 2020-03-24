import {Injectable} from '@angular/core';

export enum TransferStatus {
    ERROR = 'ERROR',
    PENDING = 'PENDING',
    UPLOADING = 'UPLOADING',
    FINISHED = 'FINISHED'
}

export class TransferItem {
    label: string;
    status: TransferStatus;
    progress: number;
    error: string;

    constructor(label: string, status: TransferStatus, progress: number, error?: string) {
        this.label = label;
        this.status = status;
        this.progress = progress;
        this.error = error;
    }

    public setLabel(label: string): void {
        this.label = label;
    }

    public setProgress(progress: number): void {
        this.progress = progress;
        this.status = TransferStatus.UPLOADING;
    }

    public setCompleted(): void {
        this.status = TransferStatus.FINISHED;
    }

    public setError(error: string): void {
        this.error = error;
        this.status = TransferStatus.ERROR;
    }
}

@Injectable({providedIn: 'root'})
export class TransferService {

    processing: boolean = false;
    message: string = '';
    pendingTransfers: TransferItem[] = [];

    public addTransfer(transfer: TransferItem) {
        this.pendingTransfers.push(transfer);
    }

    public addErroredTransfer(label: string, errorMsg: string) {
        this.pendingTransfers.push(new TransferItem(label, TransferStatus.ERROR, 0, errorMsg));
    }

    public showMessage(message: string) {
        this.message = message;
        this.processing = true;
    }

    public hideMessage() {
        this.message = '';
        this.processing = false;
    }

    public deleteTransfer(transfer: TransferItem) {
        const idx = this.pendingTransfers.indexOf(transfer);
        if (idx > -1) this.pendingTransfers.splice(idx, 1);
    }

    public deleteCompletedTransfers() {
        this.pendingTransfers = this.pendingTransfers
            .filter(t => t.progress !== 100 && t.status !== TransferStatus.FINISHED && t.status !== TransferStatus.ERROR);
    }
}
