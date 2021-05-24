import {NgModule} from '@angular/core';
import {BrowserModule} from "@angular/platform-browser";
import {PlaylistTab} from "./playlist.tab";
import {PlaylistAccordionModule} from "../../components/playlist-accordion/playlist-accordion.module";

@NgModule({
    entryComponents: [],
    declarations: [PlaylistTab],
    imports: [
        BrowserModule,
        PlaylistAccordionModule
    ],
    exports: [PlaylistTab],
    providers: []
})
export class PlaylistTabModule {
}
