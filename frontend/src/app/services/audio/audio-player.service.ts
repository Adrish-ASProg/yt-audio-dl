import {Injectable} from "@angular/core";
import {AudioPlayerModule} from "./audio-player.module";
import {APIService} from "../api/api.service";
import {AudioPlayerComponent, Track} from "ngx-audio-player";

@Injectable({providedIn: AudioPlayerModule})
export class AudioPlayerService {

    public currentPlaylist: any[] = [];
    private player: AudioPlayerComponent;

    constructor(private apiService: APIService) {
    }

    public setPlayer(player: AudioPlayerComponent) {
        this.player = player;
    }

    public listenSong(id: string) {
        const track = {link: this.apiService.getSongUrl(id)} as Track;
        this.currentPlaylist = [track];
        this.player.play(track);
    }
}
