import {TestBed} from '@angular/core/testing';

import {APIService} from './api.service';
import {HttpClientModule} from "@angular/common/http";

describe('APIService', () => {

    beforeEach(() => TestBed.configureTestingModule({
        imports: [HttpClientModule],
        providers: [APIService]
    }));

    it('should be created', () => {
        const service: APIService = TestBed.get(APIService);
        expect(service).toBeTruthy();

        expect(true).toBe(true)
    });

    it('all url should match', () => {
        const urlRegex: string = "^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$";

        const urls = ["https://www.example.com", "http://www.example.com", "www.example.com",
            "example.com", "http://blog.example.com", "http://www.example.com/product",
            "http://www.example.com/products?id=1&page=2",
            "http://www.site.com:8008", "https://www.google.com",
            "http://www.google.com", "www.google.com",
            "http://www.example.com#up", "http://255.255.255.255", "255.255.255.255"];

        for (const url of urls) {
            console.log(url.match(urlRegex));
            expect(url.match(urlRegex)).toBeTruthy();
        }
    });

    it('no url should match', () => {
        const urlRegex: string = "/^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$";

        const urls = ["htt://www.google.com", "://www.google.com",
            "http://invalid.com/perl.cgi?key= | http://web-site.com/cgi-bin/perl.cgi?key1=value1&key2"];

        for (const url of urls) {
            console.log(url.match(urlRegex));
            expect(url.match(urlRegex)).toBeNull();
        }
    });
});
