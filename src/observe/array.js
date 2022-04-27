//拿到数组原型上原来的方法
let oldArrayPrototypeMethods = Array.prototype

export let arrayMethods = Object.create(oldArrayPrototypeMethods)

const methods = [
    'pop','shift','push','unshift','reverse','splice','sort'
]

methods.forEach(method=>{
    arrayMethods[method] = function(...args){
        console.log('数组方法被调用了');
        const result = oldArrayPrototypeMethods[method].apply(this,args)
        let inserted;
        //这里的this是谁？  谁调用了这些方法，this就是谁。 也就是Observe类中的value
        let ob = this.__ob__
        //使用添加的方法，往数组中添加对象，任然做不到响应式。所以我们就对添加的对象添加响应式。
        switch(method){
            case 'push':  //arr.push({a:1},{b:2}) 仍然做不到响应式
            case 'unshift': //arr.unshift({a:1},{b:2})  同理
                inserted = args
            case 'splice':  //arr.splice(0,0,{a:1}) 使用splice新增的话，新增的参数为args的第三个参数
                inserted = args.slice(2)
            default:
                break;
        }
        //如果添加了，就对添加的数组中的对象添加响应式
        if(inserted) ob.observeArray(inserted)
        ob.dep.notify()  //使用方法进行修改值时，让watcher更新
        return result
    }
})
