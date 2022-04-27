import {
    arrayMethods
} from './array'
import Dep from './dep'
class Observer {
    constructor(value) {
        this.dep = new Dep
        //给对数据劫持的value添加一个标记，只要有 __ob__就说明被监测过
        Object.defineProperty(value, '__ob__', {
            enumerable: false, //不能被枚举，也就是不能被循环遍历出来
            configurable: false, //不可以修改，不可以删除
            //将当前的实例定义到value上。这样 array.js才能使用 Class Observer上的原型方法，也就是walk,observerArray这两个方法。value这里被定义为当前实例
            value: this
        })

        //使用defineProperty数据劫持
        // 如果是数组的话就不要进行劫持，性能太差。我们这边只要重写能够改变数组本身的方法即可
        if (Array.isArray(value)) {
            // pop shift push unshift splice sort reverse
            //将arrayMethods作为value的原型   等同于 value.__proto__ = arrayMethods
            Object.setPrototypeOf(value, arrayMethods)
            //此时只是对Array中的方法做了劫持，如果数组中有对象则依然劫持不到
            this.observeArray(value) //我们使用observeArray进行对数组中的对象进行劫持，数组中的普通类型是不做观测的
        } else {
            this.walk(value)
        }
    }
    walk(data) {
        let keys = Object.keys(data)
        keys.forEach(key => {
            defineReactive(data, key, data[key])
        })
    }
    observeArray(value) {
        value.forEach(item => {
            observe(item)
        })
    }
}

function defineReactive(data, key, value) {
    let childOb = observe(value) // 用于给深层次的对象添加响应式。没有这一行的话，只能给第一层对象添加响应式
    let dep = new Dep() //每个属性都对应一个dep
    Object.defineProperty(data, key, {
        // 获取值
        get() {
            //获取数据的时候，我们让当前watcher加入subs数组中
            if(dep.target){
                dep.depend();
                if(childOb){  //可能是数组也可能是对象
                    childOb.dep.depend()  //数组存起来这个渲染的watcher。等触发的时候调用
                }
            }
            return value
        },
        //修改值
        set(newValue) {
            if (newValue == value) return
            //如果用户将值修改为对象的话，继续监控
            observe(newValue) //observe函数中有数据类型判断
            value = newValue
            //属性变化的时候，通知watcher更新
            dep.notify()
        }
    })
}

export function observe(data) {
    //这里做一个条件判断，方便后面递归给深层次的对象添加响应式
    if (typeof data != 'object' || data == null) {
        return 
    }
    //如果数据上游__ob__，说明已经被劫持过，直接返回就行。
    if(data.__ob__){
        return data
    }
    return new Observer(data)
}