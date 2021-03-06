import {Component, Renderer2, ViewContainerRef} from "@angular/core";
import {Http, RequestOptionsArgs} from "@angular/http";
import {PageableTableData} from "jigsaw/core/data/table-data";

@Component({
  templateUrl: './app.component.html'
})
export class ServerSidePagingDemoComponent {
    public pageable:PageableTableData;

    constructor(public viewContainerRef: ViewContainerRef,
                public renderer: Renderer2, http:Http) {
        const arg:RequestOptionsArgs = {
            url: 'http://localhost:4200/mock-data/array-collection/paging-data.json',
            params: {aa: 11, bb: 22}
        };
        this.pageable = new PageableTableData(http, arg);
        this.pageable.fromAjax();
    }

    getCurrentPage(message:any){
        console.log("current page is: "+message);
    }
    getPageSize(message:any){
        console.log("page size is: "+message);
    }
}

