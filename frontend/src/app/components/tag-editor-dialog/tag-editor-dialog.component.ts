import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FileStatus} from "../../model/filestatus.model";

@Component({
    selector: 'app-tag-editor-dialog',
    templateUrl: './tag-editor-dialog.component.html',
    styleUrls: ['./tag-editor-dialog.component.scss']
})
export class TagEditorDialog {

    constructor(private dialogRef: MatDialogRef<TagEditorDialog>,
                @Inject(MAT_DIALOG_DATA) public data: FileStatus) {}

    onValidButtonClicked(): void { this.dialogRef.close(this.data); }

    onCancelButtonClicked(): void { this.dialogRef.close(); }

}
