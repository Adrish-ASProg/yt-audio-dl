import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";

import {IonicModule} from "@ionic/angular";

import {SettingsServiceModule} from "../../services/settings/settings-service.module";
import {SettingsDialog} from './settings-dialog.component';

describe('SettingsDialogComponent', () => {
    let component: SettingsDialog;
    let fixture: ComponentFixture<SettingsDialog>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SettingsDialog],
            imports: [
                BrowserAnimationsModule,
                FormsModule,
                CommonModule,
                IonicModule,

                SettingsServiceModule,
                MatInputModule,
                MatButtonModule,
                MatAutocompleteModule,
                MatIconModule
            ],
            providers: [
                MatDialogModule,
                {provide: MatDialogRef, useValue: {}},
                {provide: MAT_DIALOG_DATA, useValue: {}}
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SettingsDialog);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
