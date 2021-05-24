import {Component, ViewChild} from '@angular/core';
import {PlaylistAccordionComponent} from "../../components/playlist-accordion/playlist-accordion.component";

@Component({
    selector: 'app-playlist-tab',
    templateUrl: './playlist.tab.html',
    styleUrls: ['./playlist.tab.scss'],
})
export class PlaylistTab {

    @ViewChild('playlistAccordion') playlistAccordion: PlaylistAccordionComponent;

    constructor() {
    }

    public getPlaylists() {
        return this.playlistAccordion.getPlaylists();
    }

    public refresh() {
        this.playlistAccordion.refreshPlaylists();
    }
}
