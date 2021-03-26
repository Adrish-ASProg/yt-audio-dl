import {Injectable} from '@angular/core';
import {LoadingController} from "@ionic/angular";

@Injectable({providedIn: 'root'})
export class LoadingService {

    loadingDialog: HTMLIonLoadingElement;

    constructor(private loadingController: LoadingController) {
    }

    async showDialog(message: string) {
        await this.dismissDialog();
        this.loadingDialog = await this.loadingController.create({message});
        await this.loadingDialog.present();
    }

    async dismissDialog() {
        if (this.loadingDialog != null) {
            await this.loadingDialog.dismiss();
        }
    }
}
