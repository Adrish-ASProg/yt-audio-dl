import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FileStatus} from "../../model/filestatus.model";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {SelectionModel} from "@angular/cdk/collections";

@Component({
    selector: 'app-file-status-table',
    templateUrl: './file-status-table.component.html',
    styleUrls: ['./file-status-table.component.scss']
})
export class FileStatusTableComponent implements OnInit {

    @Output("fileNameClicked") fileNameClicked = new EventEmitter();
    @Output("downloadButtonClicked") downloadButtonClicked = new EventEmitter<string>();

    @Input() displayedColumns: string[] = [];

    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) sort: MatSort;
    dataSource = new MatTableDataSource<FileStatus>(this.filesStatus);

    private _filesStatus: FileStatus[] = [];
    private selection: SelectionModel<FileStatus>;

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

    public ngOnInit() {
        const initialSelection = [];
        const allowMultiSelect = true;
        this.selection = new SelectionModel<FileStatus>(allowMultiSelect, initialSelection);
    }

    public getFileStatusClass(progressStatus: string): string {
        return (progressStatus === "COMPLETED") ? "completed" :
            (progressStatus === "ERROR") ? "error" : "loading";
    }

    refreshDataTable(data: FileStatus[]) {
        this.dataSource.data = data;
    }

    //#region Selection

    getSelected(): FileStatus[] {
        return this.selection.selected;
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
