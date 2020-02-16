import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {FileStatus} from "../../model/filestatus.model";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-file-status-table',
    templateUrl: './file-status-table.component.html',
    styleUrls: ['./file-status-table.component.scss']
})
export class FileStatusTableComponent {

    @Output("fileNameClicked") fileNameClicked = new EventEmitter();

    @Input() displayedColumns: string[] = [];

    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) sort: MatSort;
    dataSource = new MatTableDataSource<FileStatus>(this.filesStatus);

    private _filesStatus: FileStatus[] = [];
    public selection: SelectionModel<FileStatus> = new SelectionModel<FileStatus>(true, []);

    get filesStatus(): FileStatus[] {
        return this._filesStatus;
    }

    @Input()
    set filesStatus(filesStatus: FileStatus[]) {
        this._filesStatus = filesStatus;

        this.dataSource = new MatTableDataSource(this.filesStatus);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    constructor(private snackBar: MatSnackBar) {}

    showSnackbar(e: MouseEvent, filename: string) {
        e.stopPropagation();
        this.snackBar.open(filename, "Hide", {duration: 2000});
    }

    refreshDataTable(data: FileStatus[]) {
        this.dataSource.data = data;
    }

    //#region Selection

    getSelected(): FileStatus[] {
        return this.selection.selected;
    }

    resetSelection(): void {
        this.selection.clear();
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected == numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }

    // #endregion
}
