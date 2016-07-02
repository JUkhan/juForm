import {Injectable} from '@angular/core';
import {HttpClient} from './HttpClient';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Rx';
// import 'rxjs/add/operator/share';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/do';
// import 'rxjs/add/observable/interval';
// import 'rxjs/add/operator/switchMap';

declare var window: any;
declare var jQuery: any;

@Injectable()
export class AppService extends HttpClient {
    public documentClick: Observable<any>;
    private securedViews: string[];
    appObservable: Observable<any>;
    private _appObserver: any;
    overLayElement: any;

    constructor(http: Http) {
        super(http);
        this.setEventListeners();
        this.setSecuredViews();
        this.appObservable = new Observable(observer =>
            this._appObserver = observer).share();

    }

    notifyAll(obj: any) {
        this._appObserver.next(obj);
    }
    errorHandler(obj: any) {
        this.overlay(false);
        if (obj.error) {
            this.notifyAll({ key: 'error', message: obj.error });
        }
    }
    setEventListeners() {
        this.documentClick = Observable.fromEvent(document, 'mousedown').share();
    }
    get(url) {
        this.overlay(true);
        return this._get(url)
            .do(() => this.overlay(false));
    }
    getObject(url) {
        this.overlay(true);
        return this.http.get(this.baseUrl + url)
            .map(response => response.json())
            .do(() => this.overlay(false));
    }
    getObjectApi(url: string) {
        this.overlay(true);
        return this.http.get(this.baseUrl + 'api/' + url + (url.indexOf('?') > 0 ? '&' : '?') + 'api_token=' + this.getToken())
            .map(response => response.json())
            .do(() => this.overlay(false));

    }
    getInterval(url, interval = 1000) {
        return Observable.interval(interval).switchMap(res => this._get(url));
    }
    post(url, data) {
        this.overlay(true);
        return this._post(url, data)
            .do(() => this.overlay(false));
    }
    getApi(url) {
        this.overlay(true);
        return this._getApi(url)
            .do(() => this.overlay(false));
    }
    postUploadApi(url, data) {
        this.overlay(true);
        return this.upload(url, data)
            .do(this.errorHandler.bind(this))
            .map((res: any) => res.data);
    }
    putUploadApi(url, data) {
        this.overlay(true);
        return this.upload(url + '/update', data)
            .do(this.errorHandler.bind(this))
            .map((res: any) => res.data);
    }
    postApi(url, data) {
        this.overlay(true);
        return this._postApi(url, data)
            .do(() => this.overlay(false));
    }
    putApi(url, data) {
        this.overlay(true);
        return this._putApi(url, data)
            .do(() => this.overlay(false));
    }
    deleteApi(url) {
        this.overlay(true);
        return this._deleteApi(url)
            .do(() => this.overlay(false));
    }
    mobileCheck2() {
        return 'ontouchstart' in document.documentElement;
    }
    setSecuredViews() {
        this.securedViews = ['lectureForm', 'bookForm', 'topicForm', 'verseForm', 'hadithForm'];
    }
    checkPermission(urlPath: string) {

        let exist = this.securedViews.find(url => url === urlPath);
        if (exist) {
            return sessionStorage.getItem('USER') ? true : false;
        }
        return true;
    }
    logout() {
        sessionStorage.removeItem('USER');

    }
    login(user: any) {
        this.overlay(true);
        return this._post('loginme', user)
            .do(res => {
                this.overlay(false);
                if (res.success) {
                    sessionStorage.setItem('USER', JSON.stringify(res));
                    this.notifyAll({ key: 'loginSuccess' });
                    this.notifyAll({ key: 'login', value: false });
                }
            });

    }
    isLoggedIn() {
        return sessionStorage.getItem('USER') ? true : false;
    }
    mobileCheck() {
        var check = false;
        (function (a) { if (/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }

    overlay(show) {
        if (!this.overLayElement) {
            this.overLayElement = jQuery('.overlay');
        }
        if (show) {
            this.overLayElement.show();
        } else {
            this.overLayElement.hide();
        }
    }
}
