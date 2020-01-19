import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {FileStatus} from "../../model/filestatus.model";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

@Component({
    selector: 'app-file-status-table',
    templateUrl: './file-status-table.component.html',
    styleUrls: ['./file-status-table.component.scss']
})
export class FileStatusTableComponent {

    @Output("refreshButtonClicked") refreshButtonClicked = new EventEmitter();
    @Output("downloadButtonClicked") downloadButtonClicked = new EventEmitter<string>();
    @Input() displayedColumns: string[] = [];
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) sort: MatSort;
    dataSource = new MatTableDataSource<FileStatus>(this.filesStatus);

    private _filesStatus: FileStatus[] = [];

    get filesStatus(): FileStatus[] { return this._filesStatus; }

    @Input()
    set filesStatus(filesStatus: FileStatus[]) {
        this._filesStatus = filesStatus;

        this.dataSource = new MatTableDataSource(this.filesStatus);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }
}
