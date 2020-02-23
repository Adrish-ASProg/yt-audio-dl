import {HttpErrorResponse} from "@angular/common/http";
import {Observable, Observer} from "rxjs";

export class YTDLUtils {
    public static copyObject(object: Object): any {
        return JSON.parse(JSON.stringify(object));
    }

    static parseErrorBlob(err: HttpErrorResponse): Observable<any> {
        const reader: FileReader = new FileReader();

        const obs = new Observable((observer: Observer<any>) => {
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    observer.next(JSON.parse(reader.result));
                }
                observer.complete();
            }
        });
        reader.readAsText(err.error);
        return obs;
    }

    static saveBlobToStorage(blob: Blob, filename: string, mimeType: string): void {
        // It is necessary to create a new blob object with mime-type explicitly set
        // otherwise only Chrome works like it should
        const newBlob = new Blob([blob], {type: mimeType});

        // IE doesn't allow using a blob object directly as link href
        // instead it is necessary to use msSaveOrOpenBlob
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(newBlob);
            return;
        }

        // For other browsers:
        // Create a link pointing to the ObjectURL containing the blob.
        const data = window.URL.createObjectURL(newBlob);
        const link = document.createElement('a');
        link.href = data;
        link.download = filename;
        // this is necessary as link.click() does not work on the latest firefox
        link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));

        setTimeout(function () {
            // For Firefox it is necessary to delay revoking the ObjectURL
            window.URL.revokeObjectURL(data);
            link.remove();
        }, 100);
    }
}
