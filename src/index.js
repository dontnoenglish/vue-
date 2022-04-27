import { init } from './init'
import { lifecycleMixin } from './lifecycle'
import { renderMixin } from './vdom/index'
/*
   这里为什么不用class，而是用function呢，因为我们后续的操作大多数要往vue的原型上加方法，
   而class往原型上加方法，要在class类中写，而function则直接在prototype上加就行。vue源码也是如此
*/

function Vue(options){
    this._init(options)
}
init(Vue)  //挂载操作
lifecycleMixin(Vue)  // _update
renderMixin(Vue) // _render

export default Vue

