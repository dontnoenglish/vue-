//声明周期

import { mergeOptions } from "../util";

export function initGlobalApi(Vue){
    Vue.options = {}
    Vue.mixin = function (mixin){
        //合并对象 (先考虑声明周期)  暂时不考虑 data computed watch
        this.options = mergeOptions(this.options,mixin)
    }
}
