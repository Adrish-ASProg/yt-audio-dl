import {Injectable} from '@angular/core';
import {ToastController} from '@ionic/angular';

@Injectable({providedIn: 'root'})
export class UtilsService {

    constructor(private toastController: ToastController) {
    }

    async showToast(message: string, duration = 2000, showCloseButton = true) {
        const toast = await this.toastController.create({
            message: message,
            duration: duration
        });
        return toast.present();
    }
}
