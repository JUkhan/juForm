import {Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef} from 'angular2/core';
//import {Observable} from 'rxjs/observable';
@Component({
    selector: '.juPager, [juPager]',
    template: require('./juPager.html'),
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class juPagerComponent implements OnInit, OnChanges {
    @Output() pageChange = new EventEmitter();
    @Output() onInit = new EventEmitter();
    @Input() linkPages: number = 10;
    @Input() pageSize: number = 10;
    @Input() data;

    sspFn: Function;
    totalPage: number = 0;
    activePage: number = 1;
    list: any[] = [];
    searchText: any='';
    private groupNumber: number = 1;

    constructor(private cd: ChangeDetectorRef) {

    }
    set_sspFn(callback:Function){
        this.sspFn=callback;
        this.firePageChange();
    }
    ngOnChanges(changes) {
        if (this.data) {
            this.calculatePagelinkes();
        }
    }
    ngOnInit() {
        this.pageSize = +this.pageSize;
        this.linkPages = +this.linkPages;
        this.groupNumber = +this.groupNumber;
        this.onInit.next(this);
        this.calculatePagelinkes();        
    }
    ngOnDestroy() { }

    isDisabledPrev() {
        if (this.sspFn) {
            return !(this.groupNumber > 1);
        }
        if (!this.data) {
            return true;
        }
        return !(this.groupNumber > 1);
    }
    isDisabledNext() {
        if (this.sspFn) {
            return !this.hasNext();
        }
        if (!this.data) {
            return true;
        }
        return !this.hasNext();
    }
    clickNext() {
        if (this.hasNext()) {
            this.groupNumber++;
            this.calculatePagelinkes();
        }
    }
    clickPrev() {
        this.groupNumber--;
        if (this.groupNumber <= 0) {
            this.groupNumber++;
        } else {
            this.calculatePagelinkes();
        }

    }
    clickPage(index: number) {
        this.activePage = index;
        this.firePageChange();
    }
    search(searchText: string) {
        this.searchText = searchText;
        this.activePage = 1;
        this.firePageChange();
    }
    firePageChange(isFire: boolean = false) {
        if (this.sspFn) {
            this.sspFn({ pageSize: this.pageSize, pageNo: this.activePage, searchText: this.searchText })
                .subscribe(res => {
                    this.totalPage =res.totalPage;
                    this.pageChange.next(res.data);
                    if (this.activePage == 1 || isFire) {
                        this.calculatePagelinkes(false);
                    }
                });
        } else {
            if (!this.data) return;
            let startIndex = (this.activePage - 1) * this.pageSize;
            this.pageChange.next(this.data.slice(startIndex, startIndex + this.pageSize));
        }
    }
    calculatePagelinkes(isFire: boolean = true) {
        let start = 1, end = 0;
        if (this.groupNumber > 1) {
            start = (this.groupNumber - 1) * this.linkPages + 1;
        }
        this.activePage = start;
        end = this.groupNumber * this.linkPages;
        let totalPage = this.getTotalPage();
        if (end > totalPage) {
            end = totalPage;
        }

        this.list = [];
        for (var index = start; index <= end; index++) {
            this.list.push(index);
        }
        this.cd.markForCheck();
        if (isFire) {
            this.firePageChange(isFire);
        }

    }

    private hasNext() {
        if (this.sspFn) {
            let totalPage = this.getTotalPage();
            return totalPage > this.groupNumber * this.linkPages;
        }
        if (!this.data) false;
        let len = this.data.length;
        if (len == 0) return false;

        let totalPage = this.getTotalPage();
        return totalPage > this.groupNumber * this.linkPages;
    }
    private getTotalPage() {
        if (this.sspFn) {
              return this.totalPage;
        }
        if (!this.data) return 0;
        let len = this.data.length;
        if (len == 0) return 0;

        return len / this.pageSize + ((len % this.pageSize) > 0 ? 1 : 0);
    }
}