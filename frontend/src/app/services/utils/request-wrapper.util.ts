import {Observable, of, throwError} from "rxjs";
import {catchError, mergeMap, switchMap, tap} from "rxjs/operators";
import {LoadingService} from "../loading/loading.service";

export class RequestWithLoader<T> {

    loadingService: LoadingService;
    loadingMessage: string;
    wrapped$: Observable<T>;

    constructor(wrapped$: Observable<T>, loadingService: LoadingService, loadingMessage: string) {

        this.loadingService = loadingService;
        this.loadingMessage = loadingMessage;

        this.wrapped$ = of(null)
            .pipe(
                mergeMap(_ => this.showLoadingDialog()),
                switchMap(_ => wrapped$),
                tap(_ => this.dismissLoadingDialog()),
                catchError(e => {
                    this.dismissLoadingDialog();
                    return throwError(e);
                })
            );
    }

    public getObservable() {
        return this.wrapped$;
    }

    private async showLoadingDialog() {
        await this.loadingService.showDialog(this.loadingMessage);
    }

    private async dismissLoadingDialog() {
        await this.loadingService.dismissDialog();
    }
}
