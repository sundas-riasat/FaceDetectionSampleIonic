import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    url = null;

    constructor(private http: HttpClient) {
        this.url = localStorage.getItem('url');
    }

    postImage(data: any, w, h) {
        if (this.url) {
            return this.http.post('http://' + this.url + ':5000/recognize-face', {data: data}, {
                headers: {
                    'shape': '(' + h + ',' + w + ',3)',
                    'content-type': 'application/json'
                }
            });
        }
    }

    setURL(url) {
        this.url = url;
        localStorage.setItem('url', this.url);
    }

}
