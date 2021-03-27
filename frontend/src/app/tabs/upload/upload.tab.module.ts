import {NgModule} from '@angular/core';
import {BrowserModule} from "@angular/platform-browser";
import {IonicModule} from "@ionic/angular";
import {UploadTab} from "./upload.tab";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";

@NgModule({
    entryComponents: [],
    declarations: [UploadTab],
    imports: [
        IonicModule,
        FormsModule,
        BrowserModule,

        MatFormFieldModule,
        MatInputModule
    ],
    exports: [UploadTab],
    providers: []
})
export class UploadTabModule {
}
