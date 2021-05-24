import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import {BehaviorSubject, Observable, of} from "rxjs";
import {FileStatus} from "../model/filestatus.model";
import {APIService} from "../services/api/api.service";
import {catchError, finalize} from "rxjs/operators";

export class FileStatusDataSource implements DataSource<FileStatus> {

    public data: FileStatus[];
    public totalLength: number = 0;
    private fileStatusSubject = new BehaviorSubject<FileStatus[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    constructor(private apiService: APIService) {
    }

    connect(collectionViewer: CollectionViewer): Observable<FileStatus[]> {
        return this.fileStatusSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.fileStatusSubject.complete();
        this.loadingSubject.complete();
    }

    public loadFileStatus(filter = "", sort = {}, pageIndex = 0, pageSize = 10) {
        this.loadingSubject.next(true);

        this.apiService.getFileStatus(filter, sort, pageIndex, pageSize)
            .pipe(
                catchError(() => of({
                    totalLength: 0,
                    filesStatus: []
                })),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(response => {
                this.data = response.filesStatus;
                this.totalLength = response.totalLength;
                this.fileStatusSubject.next(response.filesStatus)
            });
    }
}
