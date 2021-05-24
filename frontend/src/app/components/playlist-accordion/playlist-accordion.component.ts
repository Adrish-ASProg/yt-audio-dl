import {Component} from '@angular/core';
import {PlaylistDataSource} from "../../datasource/playlist-datasource.model";
import {APIService} from "../../services/api/api.service";
import {Playlist} from "../../model/playlist.model";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {AppManager} from "../../services/request-handler/app-manager.service";
import {SettingsService} from "../../services/settings/settings.service";

@Component({
    selector: 'app-playlist-tree',
    templateUrl: './playlist-accordion.component.html',
    styleUrls: ['./playlist-accordion.component.scss'],
})
export class PlaylistAccordionComponent {

    dataSource: PlaylistDataSource;

    constructor(private apiService: APIService,
                private appManager: AppManager,
                private settings: SettingsService) {
        this.dataSource = new PlaylistDataSource(apiService);
    }

    public getPlaylists(): Playlist[] {
        return this.dataSource.data;
    }

    public refreshPlaylists() {
        this.dataSource.loadPlaylists();
    }

    public downloadPlaylist(playlist: Playlist) {
        const songsDirectory = this.settings.getSongsDirectory();
        if (!songsDirectory) {
            alert("Missing songs directory, you must specify it in the settings menu.");
            return;
        }

        this.appManager.sendPlaylistDownloadRequest(playlist.name, songsDirectory).then();
    }

    public renamePlaylist(playlist: Playlist) {
        const newPlaylistName = prompt("New playlist name:", playlist.name);
        if (!newPlaylistName) {
            return;
        }

        this.appManager.sendPlaylistRenameRequest(playlist.name, newPlaylistName)
            .subscribe(() => this.refreshPlaylists());
    }

    public deletePlaylist(playlist: Playlist) {
        if (confirm(`Do you really want to delete playlist ${playlist.name} ?`))
            this.apiService.deletePlaylist(playlist.name)
                .subscribe(() => this.dataSource.loadPlaylists());
    }

    public drop(playlist: Playlist, event: CdkDragDrop<string[]>) {
        moveItemInArray(playlist.files, event.previousIndex, event.currentIndex);
        this.dataSource.savePlaylist(playlist);
    }
}
