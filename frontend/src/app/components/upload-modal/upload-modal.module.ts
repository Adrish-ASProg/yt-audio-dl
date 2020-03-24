import {NgModule} from '@angular/core';
import {UploadModalComponent} from "./upload-modal.component";
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";

@NgModule({
    declarations: [UploadModalComponent],
    imports: [IonicModule, CommonModule]
})
export class UploadModalModule {}
