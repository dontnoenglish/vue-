export function renderMixin(Vue){
    Vue.prototype._c = function(){ //创建虚拟元素(vnode)
        return createElement(...arguments)
    }
    Vue.prototype._s = function(val){ // 代表mustache中的变量
        return val == null?'':(typeof val == 'object')?JSON.stringify(val):val
    }
    Vue.prototype._v = function(){  //创建虚拟文本节点
        return createText(...arguments)
    }
    Vue.prototype._render = function(){
        const vm = this
        const render = vm.$options.render
        let vnode = render.call(vm)
        return vnode
    }
}

function createElement(tag,data={},...children){
    return vnode(tag,data,data.key,children)
}
function createText(text){
    return vnode(undefined,undefined,undefined,undefined,text)
}
//用来产生虚拟dom
function vnode(tag,data,key,children,text){
    return {
        tag,
        data,
        key,
        children,
        text
    }
}
