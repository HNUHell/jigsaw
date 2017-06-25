import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {
    PopupDisposer, PopupInfo, PopupOptions, PopupPoint, PopupPositionOffset, PopupPositionType,
    PopupService
} from "../../../../rdk/service/popup.service";

@Component({
    templateUrl: 'popUpOption.html',
    styleUrls: ['popUpOption.scss']
})
export class DialogPopOptionDemo implements OnInit {

    private _dialogInfo: PopupInfo;

    private option: PopupOptions;

    private popPositionTypes: object[];

    private selectedPositionType: object;

    private poses: object[];

    private selectedPos: any;

    private detailPos: PopupPoint;

    private offset: PopupPositionOffset;

    @ViewChild("left") left: ElementRef;
    @ViewChild("middle") middle: ElementRef;
    @ViewChild("right") right: ElementRef;

    constructor(private popupService: PopupService) {

    }

    ngOnInit() {
        this.generatePopPosition();
        this.generatePopPos();
        this.detailPos = {x: null, y: null};
        this.offset = {top: 10, left: 10, right: null, bottom: null};
        this.option = {
            modal: false,
            posType: PopupPositionType.absolute
        };
    }

    close() {
        this._dialogInfo.dispose();
    }

    generatePopPos() {
        this.poses = [];
        this.poses.push({label: "left", ele: this.left});
        this.poses.push({label: "middle", ele: this.middle});
        this.poses.push({label: "right", ele: this.right});
        this.poses.push({label: "no"});
        this.poses.push({label: "point"});
        this.selectedPos = this.poses[0];
    }

    generatePopPosition() {
        this.popPositionTypes = [];
        for (let prop in PopupPositionType) {
            if (typeof PopupPositionType[prop] === 'number')
                this.popPositionTypes.push({label: prop, id: PopupPositionType[prop]});
        }
        this.selectedPositionType = this.popPositionTypes[1];
    }

    popupDialog1(ele: TemplateRef<any>) {
        this.option.posOffset = {
            top: this.offset.top === null ? this.offset.top : Number(this.offset.top),
            left: this.offset.left === null ? this.offset.left : Number(this.offset.left),
            right: this.offset.right === null ? this.offset.right : Number(this.offset.right),
            bottom: this.offset.bottom === null ? this.offset.bottom : Number(this.offset.bottom)
        };

        if (this.selectedPos.label != "point") {
            this.option.pos = this.selectedPos.ele;
        } else {
            this.option.pos = {
                x: this.detailPos.x === null ? this.detailPos.x : Number(this.detailPos.x),
                y: this.detailPos.y === null ? this.detailPos.y : Number(this.detailPos.y),
            };
        }

        if(this._dialogInfo){
            this._dialogInfo.dispose();
        }

        this._dialogInfo = this.popupService.popup(ele, this.option);
    }

}