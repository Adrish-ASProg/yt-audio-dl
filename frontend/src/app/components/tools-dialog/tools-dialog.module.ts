import {NgModule} from '@angular/core';
import {ToolsDialog} from "./tools-dialog.component";
import {MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatExpansionModule} from "@angular/material/expansion";
import {FormsModule} from "@angular/forms";
import {MatSelectModule} from "@angular/material/select";
import {CommonModule} from "@angular/common";

import {IonicModule} from "@ionic/angular";

import {EllipsisModule} from "ngx-ellipsis";

@NgModule({
    declarations: [ToolsDialog],
    imports: [
        FormsModule,
        CommonModule,
        IonicModule,

        MatDialogModule,
        MatExpansionModule,
        MatSelectModule,
        MatGridListModule,
        MatButtonModule,

        EllipsisModule
    ]
})
export class ToolsDialogModule {}
