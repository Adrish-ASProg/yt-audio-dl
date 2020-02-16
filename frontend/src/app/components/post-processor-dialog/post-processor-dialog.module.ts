import {NgModule} from '@angular/core';
import {PostProcessorDialog} from "./post-processor-dialog.component";
import {MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatExpansionModule} from "@angular/material/expansion";
import {FormsModule} from "@angular/forms";
import {MatSelectModule} from "@angular/material/select";
import {CommonModule} from "@angular/common";

@NgModule({
    declarations: [PostProcessorDialog],
    imports: [
        FormsModule,
        CommonModule,

        MatDialogModule,
        MatExpansionModule,
        MatSelectModule,
        MatGridListModule,
        MatButtonModule
    ]
})
export class PostProcessorDialogModule {}
