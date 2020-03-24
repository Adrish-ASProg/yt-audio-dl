import {Injectable} from '@angular/core';
import {ModalController, ToastController} from '@ionic/angular';
import {UploadModalComponent} from "../../components/upload-modal/upload-modal.component";

@Injectable({providedIn: 'root'})
export class UtilsService {

    constructor(private toastController: ToastController,
                private modalController: ModalController) {}

    async showTransferModal() {
        const modal = await this.modalController.create({component: UploadModalComponent});
        return await modal.present();
    }

    async showToast(message: string, duration = 2000, showCloseButton = true) {
        const toast = await this.toastController.create({
            message: message,
            duration: duration
        });
        return toast.present();
    }
}
