import Dep from "./observe/dep"
import { observe } from "./observe/index"
import Watcher from "./observe/watcher"
import { proxy } from "./util"
export function initState(vm){
    const opts = vm.$options
    if(opts.props){
        initProps(vm)
    }
    // if(opts.data){
        initData(vm)
    // }
    if(opts.methods){
        initMethods(vm)
    }
    if(opts.computed){
        initComputed(vm)
    }
}

function initProps(vm){

}
//初始化data
function initData(vm){
    let data = vm.$options.data
    //这里的data有可能是箭头函数，有可能是对象。如果是箭头函数的话，那他的this就不会指向vm，所以我们要使用call改变this指向
    vm._data = data = typeof data == 'function' ? data.call(vm) : data  //此时data就肯定是一个对象了
    //当我去vm上面取data中的数据，不再是vm._data.xxx  而是直接vm.xxx 。此时，我们就需要代理
    for(let key in data){
        proxy(vm,'_data',key)
    }
    //接下来，我们就要对data这个对象进行一个数据劫持
    observe(data)
}

function initMethods(vm){

}

//computed 有缓存，在不使用的时候，是不会调用的。多次调用，也只执行一次。在它依赖的值发生变化时，它也会触发。
function initComputed(vm){
    let Computed = vm.$options.computed
    // 1.需要有watcher 2.需要通过defineProperty 3.定义布尔类型值，实现缓存
    const watchers = vm._computedWatchers = {} //用来存放计算属性的watcher
    for(let key in Computed){
        const userDef = Computed[key] //有可能是对象，有可能是函数
        //获取get方法
        const getter = typeof getter == 'function' ? userDef : userDef.get  
        watchers[key] = new Watcher(vm,getter,()=>{},{lazy:true}) //计算属性用时在调用
        defineComputed(vm,key,userDef)  //有点类似defineReactive()
    }
}

function defineComputed(vm,key,userDef){
    const sharePropertyDefinition = {
        enumerable:true, //可以被枚举
        configurable:true, //属性可以被修改
        get:()=>{},
        set:()=>{}
    }
    if(typeof userDef == 'function'){
        sharePropertyDefinition.get = createComputedGetter(key)  //createComputedGetter函数为添加缓存
    }else{
        sharePropertyDefinition.get = createComputedGetter(key) 
        sharePropertyDefinition.set = userDef.set
    }
    Object.defineProperty(vm,key,sharePropertyDefinition)
}

function createComputedGetter(key){
    return function(){  //computed每次取值都会调用这个方法
        //拿到对应的watcher
        let watcher = this._computedWatchers[key]
        if(watcher){
            if(watcher.dirty){
                watcher.evaluate()
            }
            if(Dep.target){ //说明还有渲染watcher
                watcher.depend()
            }
        }
        return watcher.value  //默认返回watcher上的值
    }
}

//watch本质上也是一个watcher，这个watcher有什么特点呢？默认会存一个老值，在初始化vue的时候。每次更新数据会再拿到一个新值。
