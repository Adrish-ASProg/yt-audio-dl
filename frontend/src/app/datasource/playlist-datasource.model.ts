import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import {BehaviorSubject, Observable, of} from "rxjs";
import {Playlist} from "../model/playlist.model";
import {APIService} from "../services/api/api.service";
import {catchError, finalize} from "rxjs/operators";

export class PlaylistDataSource extends DataSource<Playlist> {

    public data: Playlist[];
    private playlistSubject = new BehaviorSubject<Playlist[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    constructor(private apiService: APIService) {
        super();
        this.loadPlaylists();
    }

    connect(collectionViewer: CollectionViewer): Observable<Playlist[]> {
        return this.playlistSubject.asObservable();
    }

    disconnect(): void {
        this.playlistSubject.complete();
        this.loadingSubject.complete();
    }

    public loadPlaylists() {
        this.loadingSubject.next(true);

        this.apiService.getPlaylists()
            .pipe(
                catchError(() => of([] as Playlist[])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe((playlists: any) => {
                this.data = playlists;
                this.playlistSubject.next(playlists)
            });
    }

    public savePlaylist(playlist: Playlist) {
        this.loadingSubject.next(true);

        this.apiService.updatePlaylist(playlist)
            .pipe(finalize(() => this.loadingSubject.next(false)))
            .subscribe();
    }
}
