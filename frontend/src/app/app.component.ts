import {Component} from '@angular/core';
import {APIService} from "./service/api.service";
import {ConvertRequest} from "./model/convertrequest.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  projectTitle: string = 'yt-audio-dl';

  request: ConvertRequest = {
    url: "https://www.youtube.com/watch?v=zhsfn9IyiLQ",
    audioOnly: true
  };

  uuids = [];

  constructor(public apiService: APIService) {}


  test() {
    this.apiService.requestConvert(this.request)
      .subscribe(uuid => this.uuids.push(uuid));
  }
}
