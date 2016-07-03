import {Http, Headers} from '@angular/http';
import {Observable} from 'rxjs/Rx';

//import 'rxjs/add/operator/map';

export class HttpClient {
  http: Http;
  baseUrl: string = 'http://localhost:8000/';

  constructor(http: Http) {
    this.http = http;
  }
  getImg(imageName: string) {
    if (!imageName) {
      imageName = 'shield-with-beta.png';
    }
    return this.baseUrl + 'img/' + imageName;
  }
  getAuthorizationHeader() {
    let user = JSON.parse(sessionStorage.getItem('USER'));
    let header = new Headers();
    header.append('Authorization', 'Bearer api_token' + user.api_token);

    return header;
  }
  getHeaderContent() {
    let headers = new Headers();
    //headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Content-Type', 'application/json');
    //headers.append('Access-Control-Allow-Origin', 'http://localhost:8080/');
    return headers;
  }
  upload(url, model: any) {
    url = this.baseUrl + 'api/' + url + '/?api_token=' + this.getToken();
    return Observable.fromPromise(new Promise((resolve, reject) => {

      let formData: FormData = new FormData();
      let xhr: XMLHttpRequest = new XMLHttpRequest();
      let map: Map<string, any> = new Map<string, any>();
      for (var prop in model) {
        if (prop === 'FILES') {
          for (var fileProp in model[prop]) {
            map.set(fileProp, '');
            if (!(model[prop][fileProp] && model[prop][fileProp].length > 0)) {
              continue;
            }

            if (model[prop][fileProp].length == 1) {
              formData.append(fileProp, model[prop][fileProp][0], model[prop][fileProp][0].name);
            }
            else {
              model[prop][fileProp].forEach((file: File) => {
                formData.append(fileProp + '[]', file, file.name);
              });
            }
          }
        } else if (!map.has(prop) && model[prop]) {
          formData.append(prop, model[prop]);
        }
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(xhr.response);
          }
        }
      };
      xhr.open('POST', url, true);
      //xhr.setRequestHeader('Content-Type', 'application/json');    

      //xhr.setRequestHeader('Authorization', 'Bearer api_token' + this.getToken());
      xhr.send(formData);

    }));
  }
  _get(url) {
    return this.http.get(this.baseUrl + url)
      .map(response => response.json())
      .map(res => res.data);

  }
  _post(url, data) {
    return this.http.post(this.baseUrl + url, JSON.stringify(data), {
      headers: this.getHeaderContent()
    })
      .map(response => response.json());
  }
  getToken() {
    let user = JSON.parse(sessionStorage.getItem('USER'));
    return user.api_token;
  }
  _getApi(url: string) {
    return this.http.get(this.baseUrl + 'api/' + url + (url.indexOf('?') > 0 ? '&' : '?') + 'api_token=' + this.getToken())
      .map(response => response.json())
      .map(res => res.data);

  }
  _postApi(url, data) {
    data.api_token = this.getToken();
    return this.http.post(this.baseUrl + 'api/' + url, JSON.stringify(data), {
      headers: this.getHeaderContent()
    })
      .map(response => response.json());
  }
  _putApi(url, data) {
    data.api_token = this.getToken();
    return this.http.post(this.baseUrl + 'api/' + url + '/update', JSON.stringify(data), {
      headers: this.getHeaderContent()
    })
      .map(response => response.json());
  }
  _deleteApi(url) {
    return this.http.get(this.baseUrl + 'api/' + url + (url.indexOf('?') > 0 ? '&' : '?') + 'api_token=' + this.getToken())
      .map(response => response.json());
  }
}
