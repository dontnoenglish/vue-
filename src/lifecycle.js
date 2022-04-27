import Watcher from './observe/watcher'
import { patch }  from './vdom/patch'
export function lifecycleMixin(Vue){
    Vue.prototype._update = function (vnode){
        //将虚拟节点转化为真实节点
        const vm = this
        //这里需要区分一下，是首次渲染，还是更新呢
        const prevVnode = vm._vnode  //首次的话 vm._vnode 是没有值的
        if(!prevVnode){
            //如果是首次渲染的话
            vm.$el = patch(vm.$el,vnode)
            vm._vnode = vnode
        }else{
            //更新的话
            vm.$el = patch(prevVnode,vnode)
        }
        // vm.$el = patch(vm.$el,vnode)  //用返回的新的节点替换原有的
    }
}

export function mountComponent(vm,el){
    vm.$el = el
    //调用render方法，去渲染el
    callHook(vm,'beforeMount')
    //先调用render方法创建虚拟节点(render)，再将虚拟节点渲染(update)到真实el上。每次数据更新都得掉这两个方法
    // vm._update(vm._render())  
    let updateComponent = ()=>vm._update(vm._render());
    new Watcher(vm,updateComponent,()=>{
        callHook(vm,'beforeUpdate')
    })
    callHook(vm,'mounted')
}


// callHook(vm,'beforeCreate')
export function callHook(vm,hook){
    const handlers = vm.$options[hook]  //vm.$options.created = [a1,a2]
    if(handlers){
        for(let i=0;i<handlers.length;i++){
            handlers[i].call(vm)
        }
    }
}
