import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSnackBar} from "@angular/material/snack-bar";

import {SettingsService} from "../../services/settings/settings.service";
import {FileStatus} from "../../model/filestatus.model";

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

    pageSize: number = 10;

    constructor(private snackBar: MatSnackBar,
                private settingsService: SettingsService) {
        this.pageSize = settingsService.getPageSize();
    }

    setPageSize(event: PageEvent) {
        this.settingsService.setPageSize(event.pageSize);
        this.pageSize = event.pageSize;
    }

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

    getPageData() {
        return this.dataSource._pageData(this.dataSource._orderData(this.dataSource.filteredData));
    }

    isEntirePageSelected() {
        return this.getPageData()
            .filter(fs => fs.status === 'COMPLETED')
            .every(fs => this.selection.isSelected(fs));
    }

    /** Select / unselect all rows on the current page. */
    masterToggle() {
        this.isEntirePageSelected() ?
            this.selection.deselect(...this.getPageData()) :
            this.selectAll();
    }

    selectAll(): void {
        this.selection.select(
            ...this.getPageData().filter(fs => fs.status === 'COMPLETED')
        );
    }

    // #endregion
}
