import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SettingsDialog} from './settings-dialog.component';
import {MatSliderModule} from "@angular/material/slider";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {SettingsServiceModule} from "../../services/settings/settings-service.module";
import {FormsModule} from "@angular/forms";

describe('SettingsDialogComponent', () => {
    let component: SettingsDialog;
    let fixture: ComponentFixture<SettingsDialog>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SettingsDialog],
            imports: [
                FormsModule,

                SettingsServiceModule,
                MatSliderModule
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
