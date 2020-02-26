import {NgModule} from '@angular/core';
import {MenuPopoverComponent} from "./menu-popover.component";
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";

@NgModule({
    imports: [
        IonicModule,
        CommonModule
    ],
    declarations: [MenuPopoverComponent]
})
export class MenuPopoverModule {
}
