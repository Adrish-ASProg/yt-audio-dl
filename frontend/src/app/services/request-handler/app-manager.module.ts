import {NgModule} from '@angular/core';
import {APIModule} from "../api/api.module";
import {UploadModalModule} from "../../components/upload-modal/upload-modal.module";
import {UploadModalComponent} from "../../components/upload-modal/upload-modal.component";

@NgModule({
    entryComponents: [UploadModalComponent],
    imports: [APIModule, UploadModalModule]
})
export class AppManagerModule {}
