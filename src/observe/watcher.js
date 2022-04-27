import { popTarget, pushTarget } from "./dep";

let id = 0;
class Watcher {
     constructor(vm,exprOrFn,cb,options){
        this.vm = vm
        this.exprOrFn = exprOrFn //数据驱动页面重新渲染的render函数
        this.cb = cb
        this.options = options
        this.id = id++  //watcher的唯一标识
        this.lazy = options.lazy
        this.dirty = options.lazy
        this.deps = []//watcher记录有多少个dep依赖他
        this.depsId = new Set
        if(typeof exprOrFn == 'function'){
            this.getter = exprOrFn
        }
        this.get()
     }
     addDep(dep){
         let id = dep.id
         if(!this.depsId.has(id)){
             this.deps.push(dep) 
             this.depsId.push(id)
             dep.addSub(this)
         }
     }
    get(){
        pushTarget(this)  //当前watcher实例
        let result = this.getter().call(this.vm);
        popTarget()
        return result
    }
    run(){
        this.get()
    }
    update(){
        // this.get() //重新渲染
        //这里不要频繁的渲染，也就是我们需要异步更新
        if(this.lazy){  //说明此时是计算属性
            this.dirty = true
        }else{
            queueWatcher(this)
        }
        
    }
    evaluate(){
        this.value = this.get()
        this.dirty = false  //取过一次值之后，设置缓存
    }
    depend(){
        //通过watcher找到对应的dep
        let i = this.deps.length
        while(i--){
            this.deps[i].depend() //让dep去存储渲染watcher
        }
    }
}

let queue = []
let has = {}
let pending = false

function queueWatcher(watcher){
    const id = watcher.id
    if(has[id] == null){  //用id标注watcher，用于去重
        queue.push(watcher)
        has[id] = true   
        if(!pending){
            pending = true
            setTimeout(()=>{
               queue.forEach(watcher=>watcher.run())
               queue = []
               has = {}
               pending = false
            })
  
        }   
    }
}

export default Watcher
