import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatTable} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSnackBar} from "@angular/material/snack-bar";

import {SettingsService} from "../../services/settings/settings.service";
import {FileStatus} from "../../model/filestatus.model";
import {merge} from "rxjs";
import {tap} from "rxjs/operators";
import {FileStatusDataSource} from "../../model/filestatus-datasource.model";
import {APIService} from "../../services/api/api.service";

@Component({
    selector: 'app-file-status-table',
    templateUrl: './file-status-table.component.html',
    styleUrls: ['./file-status-table.component.scss']
})
export class FileStatusTableComponent implements OnInit, AfterViewInit {

    @Output("fileNameClicked") fileNameClicked = new EventEmitter();

    @Input() displayedColumns: string[] = [];
    @Input() filter: string = "";

    @ViewChild(MatTable, {static: true}) table: MatTable<any>;
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) sort: MatSort;

    dataSource: FileStatusDataSource;

    selection: SelectionModel<FileStatus> = new SelectionModel<FileStatus>(true, []);

    constructor(private snackBar: MatSnackBar,
                private apiService: APIService,
                private settingsService: SettingsService) {

        this.pageSize = settingsService.getPageSize();
    }

    pageSize: number = 10;

    ngOnInit() {
        this.dataSource = new FileStatusDataSource(this.apiService);
        this.refreshTableData();
    }

    ngAfterViewInit() {
        // reset the paginator after sorting
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(tap(() => this.refreshTableData()))
            .subscribe();
    }

    public refreshTableData() {
        this.resetSelection();

        this.dataSource.loadFileStatus(
            this.filter,
            this.getSortingMode(),
            this.paginator.pageIndex,
            this.paginator.pageSize);
    }

    public getSortingMode(): any {
        return {
            type: this.camelToSnakeCase((this.sort.active || "startDate")).toUpperCase(),
            direction: (this.sort.direction || "desc").toUpperCase()
        };
    }

    getPageData() {
        return this.dataSource.data;
    }

    showSnackbar(e: MouseEvent, filename: string) {
        e.stopPropagation();
        this.snackBar.open(filename, "Hide", {duration: 2000});
    }

    //#region Selection

    getSelected(): FileStatus[] {
        return this.selection.selected;
    }

    resetSelection(): void {
        this.selection.clear();
    }

    private camelToSnakeCase = str => (str || "").replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

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
