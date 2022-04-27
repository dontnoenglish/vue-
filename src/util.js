export function proxy(vm,data,key){
    Object.defineProperty(vm,key,{
        get(){
            console.log(vm,data,key);
            return vm[data][key]
        },
        set(newValue){
            vm[data][key] = newValue
        }
    })
}

const strats = {}

// strats.data = function (parentVal,childVal){
//     return childVal   //这里有合并data的策略
// }
// strats.computed = function (){}
// strats.watch = function (){}

const LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'update',
    'beforeDestroy',
    'destroyed'
];

//这个函数就能体现出生命周期的原理。采用数组的方法，将所有生命周期函数压进去，合适的时候调用
function mergeHook(parentVal,childValue){  //声明周期的合并
     if(childValue){
         if(parentVal){
             return parentVal.concat(childValue)  //爸爸和儿子进行合并
         }else{
             return [childValue]  //儿子需要转化为数组
         }
     }else{
         return parentVal  //直接用父亲的
     }
}

LIFECYCLE_HOOKS.forEach(hook=>{
    strats[hook] = mergeHook
})

export function mergeOptions(parent = {},child = {}){
    //遍历父亲，可能父亲有，可能儿子有
    const options = {}
    for(let key in parent){ //父亲和儿子都有，就在这处理
        mergeField(key)
    }
    for(let key in child){ //儿子有，父亲没有
        if(!parent.hasOwnProperty(key)){
            mergeField(key)
        }
    }
    function mergeField(key){  //合并字段
        if(strats[key]){
            options[key] = strats[key](parent[key],child[key])
        }else{
            options[key] = child[key]
        }
    }
    return options
}
