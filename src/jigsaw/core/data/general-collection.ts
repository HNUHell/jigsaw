import {Http, RequestOptionsArgs, Response, ResponseOptions} from "@angular/http";
import {EventEmitter} from "@angular/core";
import "rxjs/add/operator/map";
import {
    IAjaxComponentData, DataReviser, ComponentDataHelper
} from "./component-data";
import {CallbackRemoval} from "../utils/common-utils";

export abstract class AbstractGeneralCollection<T = any> implements IAjaxComponentData {
    public abstract fromObject(data: T): AbstractGeneralCollection<T>;

    protected abstract ajaxSuccessHandler(data): void;

    public http: Http;
    public dataReviser: DataReviser;
    protected _busy: boolean;

    get busy(): boolean {
        return this._busy;
    }

    protected reviseData(response: Response): any {
        const json = response.json();
        if (!this.dataReviser) {
            return json;
        }
        try {
            return this.dataReviser(json);
        } catch (e) {
            console.error('revise data error: ' + e);
            console.error(e.stack);
            return json;
        }
    }

    public fromAjax(options: RequestOptionsArgs | string): void {
        if (!this.http) {
            console.error('set a valid Http instance to the http attribute before invoking fromAjax()!');
            return;
        }

        if (this._busy) {
            this.ajaxErrorHandler(null);
            return;
        }

        this._busy = true;
        this.ajaxStartHandler();

        const op = ComponentDataHelper.castToRequestOptionsArgs(options);
        this.http.request(op.url, op)
            .map(res => this.reviseData(res))
            .subscribe(
                data => this.ajaxSuccessHandler(data),
                error => this.ajaxErrorHandler(error),
                () => this.ajaxCompleteHandler()
            );
    }

    protected componentDataHelper: ComponentDataHelper = new ComponentDataHelper();

    public refresh(): void {
        this.componentDataHelper.invokeRefreshCallback();
    }

    public onRefresh(callback: (thisData: AbstractGeneralCollection<T>) => void, context?: any): CallbackRemoval {
        return this.componentDataHelper.getRefreshRemoval({fn: callback, context: context});
    }

    public onAjaxStart(callback: (data: T) => void, context?: any): CallbackRemoval {
        return this.componentDataHelper.getAjaxStartRemoval({fn: callback, context: context});
    }

    public onAjaxSuccess(callback: (data: T) => void, context?: any): CallbackRemoval {
        return this.componentDataHelper.getAjaxSuccessRemoval({fn: callback, context: context});
    }

    public onAjaxError(callback: (error: Response) => void, context?: any): CallbackRemoval {
        return this.componentDataHelper.getAjaxErrorRemoval({fn: callback, context: context});
    }

    public onAjaxComplete(callback: () => void, context?: any): CallbackRemoval {
        return this.componentDataHelper.getAjaxCompleteRemoval({fn: callback, context: context});
    }

    protected ajaxStartHandler():void {
        this.componentDataHelper.invokeAjaxStartCallback();
    }

    protected ajaxErrorHandler(error: Response): void {
        if (!error) {
            console.error('get data from paging server error!! detail: the data collection is busy now!');
            const options = new ResponseOptions({ body: 'ERROR: the data collection is busy now!' });
            error = new Response(options.merge({ url: '' }));
            error.ok = false;
            error.status = 409;
            error.statusText = 'ERROR: the data collection is busy now!';
        } else {
            console.error('get data from paging server error!! detail: ' + error);
            this._busy = false;
        }

        this.componentDataHelper.invokeAjaxErrorCallback(error);
    }

    protected ajaxCompleteHandler(): void {
        console.log('get data from paging server complete!!');
        this.componentDataHelper.invokeAjaxCompleteCallback();
        this._busy = false;
    }

    public destroy(): void {
        this.componentDataHelper.clearCallbacks();
        this.componentDataHelper = null;
        this.dataReviser = null;
    }

    private _emitter = new EventEmitter<any>();

    public emit(value?: any): void {
        this._emitter.emit(value);
    }

    public subscribe(generatorOrNext?: any, error?: any, complete?: any): any {
        return this._emitter.subscribe(generatorOrNext, error, complete);
    }

    public unsubscribe() {
        this._emitter.unsubscribe();
    }
}

export class GeneralCollection<T> extends AbstractGeneralCollection<T> {
    [index: string]: any;

    protected ajaxSuccessHandler(data: T): void {
        this.fromObject(data);
        this.componentDataHelper.invokeAjaxSuccessCallback(data);
    }

    protected propList: string[] = [];

    public fromObject(data: T): GeneralCollection<T> {
        if (data instanceof GeneralCollection) {
            console.error("unable to make data from another GeneralCollection instance!");
            return;
        }

        let needRefresh = false;

        this.propList.forEach(prop => {
            needRefresh = true;
            delete this[prop];
        });
        this.propList.splice(0, this.propList.length);

        if (data) {
            for (let key in data) {
                if (!data.hasOwnProperty(key) || data[key] instanceof Function) {
                    continue;
                }
                needRefresh = true;
                this[key] = data[key];
                this.propList.push(key);
            }
        }

        if (needRefresh) {
            this.refresh();
        }

        return this;
    }

    public destroy(): void {
        super.destroy();
        console.log('destroying GeneralCollection....');

        this.propList.forEach((prop: string) => {
            delete this[prop];
        });
        this.propList.splice(0, this.propList.length);
    }
}
