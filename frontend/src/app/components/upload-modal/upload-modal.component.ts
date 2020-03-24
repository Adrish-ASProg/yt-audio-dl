import {Component} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {TransferService, TransferStatus} from "../../services/transfer/transfer.service";

@Component({
    selector: 'app-upload-modal',
    templateUrl: './upload-modal.component.html',
    styleUrls: ['./upload-modal.component.scss'],
})
export class UploadModalComponent {

    constructor(private modalController: ModalController,
                public transferService: TransferService) {
    }

    progressBarClass = (pendingUpload) => {
        switch (pendingUpload.status) {
            case TransferStatus.ERROR:
                return 'danger';

            case TransferStatus.PENDING:
                return 'warning';

            case TransferStatus.UPLOADING:
                return 'primary';

            case TransferStatus.FINISHED:
                return 'success';

            default:
                return 'warning';
        }
    };

    /** Display transfer info */
    showInfo(transfer) {
        if (transfer.error != void 0) {
            const message = `${transfer.label}
            Status: ${transfer.status}
            Error: ${transfer.error}`;
            alert(message);
        }
    }

    /** Delete transfer */
    removeTransfer(transfer) { this.transferService.deleteTransfer(transfer); }

    /** Delete all completed transfers */
    clearTransfers() { this.transferService.deleteCompletedTransfers(); }


    /** Fermeture de la fenêtre */
    closeModal() { return this.modalController.dismiss(); }

}
