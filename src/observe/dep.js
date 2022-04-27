let id=0
class Dep {
     constructor(){
         this.subs=[]
         this.id = id++
     }
     depend(){
        //  this.subs.push(Dep.target)  将watcher加入subs数组中
        Dep.target.addDep(this)  //实现双向记忆，watcher记住dep的同时，dep也记住watcher
     }
     addSub(watcher){
         this.subs.push(watcher)
     }
     notify(){
         this.subs.forEach(watcher=>watcher.update())
     }
}

Dep.target = null
const stack = []
//这里首先是渲染watcher，其次才是计算属性watcher
export function pushTarget(watcher){
     Dep.target = watcher
     stack.push(watcher)
}
export function popTarget(){
    // Dep.target = null
    stack.pop()  //将计算属性watcher弹出,拿到渲染watcher 
    Dep.target = stack[stack.length-1]
}

export default Dep


//每个属性都对应一个dep，dep是用来收集watcher的
