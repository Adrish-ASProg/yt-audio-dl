import {NgModule} from '@angular/core';
import {PlaylistAccordionComponent} from "./playlist-accordion.component";
import {MatButtonModule} from "@angular/material/button";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatListModule} from "@angular/material/list";
import {BrowserModule} from "@angular/platform-browser";
import {MatIconModule} from "@angular/material/icon";
import {MatBadgeModule} from "@angular/material/badge";

@NgModule({
    declarations: [PlaylistAccordionComponent],
    exports: [
        PlaylistAccordionComponent
    ],
    imports: [
        BrowserModule,
        DragDropModule,

        MatBadgeModule,
        MatButtonModule,
        MatExpansionModule,
        MatIconModule,
        MatListModule
    ]
})
export class PlaylistAccordionModule {
}
