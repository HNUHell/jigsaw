import {
    Component, AfterContentInit, Renderer2, ViewContainerRef
} from "@angular/core";
import { ArrayCollection } from "jigsaw/core/data/array-collection";

@Component({
  templateUrl: './app.component.html'
})
export class TileselectMultipleSelectDemoComponent implements AfterContentInit{
    public selectedCity: ArrayCollection<any>;
    citys = new ArrayCollection([
        {label: "北京"},
        {label: "上海"},
        {label: "南京"},
        {label: "深圳"},
        {label: "长沙"},
        {label: "西安"}
    ]);
    constructor(public viewContainerRef: ViewContainerRef,
                public renderer: Renderer2) {
    }
    ngAfterContentInit() {
        this.selectedCity= new ArrayCollection([{label: "深圳"}]);
    }
}

