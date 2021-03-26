import {Injectable} from '@angular/core';
import {File} from '@ionic-native/file/ngx';
import {AppManagerModule} from "../request-handler/app-manager.module";

@Injectable({providedIn: AppManagerModule})
export class FileTransferService {

    constructor(private file: File) {}

    writeBlobToStorage(blob: Blob, filename: string): Promise<any> {
        const dirPath = 'Download';
        return this.file.checkDir(this.file.externalRootDirectory, dirPath)
            .then(_ => {
                console.log('Directory exists', _);
                return this.file.writeFile(this.file.externalRootDirectory + dirPath, `${filename}`, blob, {replace: true});
            })
            .catch(err => {
                console.log('Directory doesn\'t exist', err);
            });
    }
}
