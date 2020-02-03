import {TestBed} from '@angular/core/testing';

import {SettingsService} from './settings.service';

describe('SettingsService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [SettingsService]
    }));

    it('should be created', () => {
        const service: SettingsService = TestBed.get(SettingsService);
        expect(service).toBeTruthy();
    });

    it('all refresh rate values should pass', () => {
        const service: SettingsService = TestBed.get(SettingsService);
        const refreshRatesInSeconds: number[] = [0.5, 1, 5, 60, 5 * 60];
        refreshRatesInSeconds.forEach(value => {
            expect(service.setRefreshRate(value * 1000)).toBeTruthy();
        });
    });

    it('no refresh rate value should pass', () => {
        const service: SettingsService = TestBed.get(SettingsService);
        const refreshRatesInMs: number[] = [-1, 0, 1, 499, 5 * 60 * 1000 + 1, 10 * 60 * 1000];
        refreshRatesInMs.forEach(value => {
            expect(service.setRefreshRate(value)).toBeFalsy();
        });
    });
});
