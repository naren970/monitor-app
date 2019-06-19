import {Subject} from 'rxjs';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/catch';
import {catchError, map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions, Response} from '@angular/http';
import * as io from 'socket.io-client';
import * as _ from "lodash";
import 'rxjs/add/operator/map';

@Injectable()
export class MessageService {
  private _configUrl = "http://localhost:1409";  // URL to web API
  private socket;
  private _options = new RequestOptions({
    headers: new Headers({ 'Content-Type': 'application/json' }),
    withCredentials: true
  })

  constructor(private _http: Http) {
    this._http = _http;
  }

  sendMessage(message) {
    this.socket.emit('add-message', message);
  }

  getServiceData() {
    const toolsJob: Subject<any> = new Subject();
    const serviceUrl = '/api/monitor';
    this._http.get(serviceUrl, this._options)
              .subscribe(
                resp => {
                  toolsJob.next(resp.json());
                },
                err => {
                  console.log(err);
                  toolsJob.error(err);
                });

    return toolsJob;
  }

  getMessages(): Observable<any> {
    let observable = new Observable(observer => {
      this.socket = io(this._configUrl);
      this.socket.on('message', (data) => {
        observer.next(data);
      });
    })
    return observable;
  }

}
