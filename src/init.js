import { compileToFunctions } from "./compiler/index"
import { callHook, mountComponent } from "./lifecycle"
import { initState } from "./state"
import { mergeOptions } from "./util"
/*
    提供初始化操作
*/

export function init(Vue){

    //全局组件和局部组件的区别
    //全局组件会在vue的初始化的时候将当前组件合并到全局上去
    Vue.prototype._init = function(options){
        const vm = this
        // vm.$options = options
        
        vm.$options = mergeOptions(vm.constructor.options,options)  //将用户自定义的options和全局的options合并

        //初始化状态 比如methods  computed  props  data
        callHook(vm,'beforeCreate') //调声明周期函数
        initState(vm)  //初始化数据之前，调用 'beforeCreate' ,初始化数据后 'created'
        callHook(vm,'created')
        //进行挂载
        if(vm.$options.el){
            vm.$mount(vm.$options.el)
        }
    }
    Vue.prototype.$mount = function(el){
        //挂载操作
        //挂载操作的优先级  render>template>el == $mount
        const vm = this
        const options = vm.$options
        el = document.querySelector(el)
        vm.$el = el
        if(!options.render){
            //没有render，就要将template转化成render
            let template = options.template
            if(!template && el){
                template = el.outerHTML
            }
            //将模板字符串转换为render函数
            const render = compileToFunctions(template)
            options.render = render  //最终渲染的时候，都是使用render方法
        }
        //需要挂载el对应的组件
        mountComponent(vm,el)
    }
}
