export function patch(oldVnode,vnode){
    //如果是真实节点的话转为虚拟dom
    if(oldVnode.nodeType == 1){
        //我们要使用虚拟dom节点(vnode)替换oldVnode
        let dom = createEle(vnode) //产生真正的dom节点
        let parentEle = oldVnode.parentNode //获取老的节点的父节点 也就是body
        parentEle.insertBefore(dom,oldVnode.nextSibling) //将真实dom节点插入body中
        parentEle.removeChild(oldVnode)  //删除老的节点
        return dom
    }else{
        //否则就是虚拟dom的比对

        //更新功能
        //1.标签不一样，直接替换。因为vue是同层级比较
        if(oldVnode.tag!=vnode.tag){
            //此时的vnode是虚拟节点，用createEle转化为真是节点，替换旧的节点
            return oldVnode.el.parentNode.replaceChild(createEle(vnode),oldVnode.el)
        }
        //2.走到这里，表示标签一样。看文本是否一样
        if(!oldVnode.tag){ //说明是文本标签
            if(oldVnode.text != vnode.text){ //如果文本不一样，旧替换。一样，就不操作。
                return oldVnode.el.textContent = vnode.text
            }
        }
        //3.标签一样。开始比对标签的属性，儿子。
        let el = vnode.el = oldVnode.el //标签一样，直接复用老节点
        updateProperties(vnode,oldVnode.data)

        // 比较孩子
        let oldChildren = oldVnode.children || []
        let newChildren = vnode.children || []
        if(oldChildren>0 && newChildren>0){
            //老的有儿子，新的有儿子。diff算法
            updateChildren(oldChildren,newChildren,el)
        }else if(oldChildren>0){  //新的没有
            el.innerHTML = ''
        }else if(newChildren>0){ // 旧的没有
            let fragment = document.createDocumentFragment() //创建一个文档碎片，避免重复的操作dom
            for(let i=0;i<newChildren.length;i++){
                let children = newChildren[i] //这里的children是虚拟dom，要转化为真实dom
                fragment.appendChild(createEle(children))
            }
            el.appendChild(fragment)
        }
    }
}
//判断新，旧节点是不是同一个vnode
function isSameVnode(oldChildren,newChildren){
    return (oldChildren.tag == newChildren) && (oldChildren.key == newChildren.key)
}


function updateChildren(oldChildren,newChildren,parent){
     function makeIndexByKey(oldChildren){
         let map = {}
         oldChildren.forEach((item,index)=>{
             map[item.key] = index
         })
         return map
     }
     let map = makeIndexByKey(oldChildren)
    //指针
    let oldStartIndex = 0 //老的起始索引
    let oldStartVnode = oldChildren[oldStartIndex]  //老的起始指针
    let oldEndIndex = oldChildren.length-1 //老的最后索引
    let oldEndVnode = oldChildren[oldEndIndex]  //老的最后指针

    let newStartIndex = 0 //新的起始索引
    let newStartVnode = newChildren[newStartIndex]  //新的起始指针
    let newEndIndex = newChildren.length-1 //新的最后索引
    let newEndVnode = newChildren[newEndIndex]  //新的最后指针
    //哪个先结束，循环就停止
    while(oldStartIndex<=oldEndIndex && newStartIndex<=newEndIndex){
        //头和头比
        if(isSameVnode(oldStartVnode,newStartVnode)){ //判断新，旧是不是同一个vnode。如果是，比对儿子
            patch(oldStartVnode,newStartVnode) //更新属性，递归更新子节点
            //指针向后移
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
        }else if(isSameVnode(oldEndVnode,newEndVnode)){  //尾和尾比
            patch(oldEndVnode,newEndVnode) 
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]
        }else if(isSameVnode(oldStartVnode,newEndVnode)){ //老的头和新的尾比
            patch(oldStartVnode,newEndVnode)
            //比完，将老的起始节点放到老的末尾节点的下一个节点的前面
            parent.insertBefore(oldStartVnode.el,oldEndVnode.el.nextSibling) 
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]
        }else if(isSameVnode(oldEndVnode,newEndVnode)){  //老的尾和新的头
            patch(oldEndVnode,newEndVnode)
            // 如果老的尾和新的头一样，将老的尾插入到新的前面
            parent.insertBefore(oldEndVnode.el,oldStartVnode.el)
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[++newStartIndex]
        }else{
            //儿子之间没有关系..  暴力比对。能复用的尽量复用
            let moveIndex = map[newStartVnode.key]
            if(moveIndex == undefined){  //如果找不到，说明没有复用的
                parent.insertBefore(createEle(newStartVnode),oldStartVnode.el)
            }else{
                let moveNode = oldChildren[moveIndex]  //这个是可以复用的
                oldChildren[moveIndex] = null   //置为null，作为标识复用过了。
                parent.insertBefore(moveNode.el,oldStartVnode.el)
                patch(moveNode,newStartVnode)
            }
            newStartVnode = newChildren[++newStartIndex]  //用新的不停去老的里面找
        }
    }
    //如果新的节点多
    if(newStartIndex <= newEndIndex){
        for(let i=newStartIndex;i<=newEndIndex;i++){
            //将新的多出来的节点插入进去。可能是向前添加，可能是向后添加
            //判断向前插入，还是在后面添加。 如果为null的话，则为往后添加。否则，向前插入
            let ele = newChildren[++i] == null ? null : newChildren[++newEndIndex].el
            parent.insertBefore(createEle(newChildren(i)),ele) //如果ele为null的话，insertBefore就是appendChild
        }
    }
    //如果旧的节点多
    if(oldStartIndex<=oldEndIndex){
        for(let i=oldStartIndex;i<=oldEndIndex;i++){
            //将旧的多出来的节点删掉
            let child = oldChildren[i]
            if(children != undefined) {
                parent.removeChild(child.el)  
            }

        }
    }
}



function createEle(vnode){
    let {tag,children,key,data,text} = vnode
    if(typeof tag == 'string'){
        //元素节点
        vnode.el = document.createElement(tag)
        //只有元素节点有属性,将属性添加至vdom上
        updateProperties(vnode)
        children.forEach(child=>{
            //遍历儿子，将儿子渲染后的结果仍到父级中。会有很多个层级的嵌套，使用递归。
            vnode.el.appendChild(createEle(child))
        })
    }else{
        //文本节点
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

function updateProperties(vnode,oldProps = {}){
     let newProps = vnode.data || {}
     let el = vnode.el
     //老的有，新的没有，就删除属性
    for(let key in oldProps){
        if(!newProps[key]){
            el.removeAttribute(key)  
        }
    }
    let oldStyle = oldProps.style || {}
    let newStyle = newStyle.style || {}
    for(let i in oldStyle){
        if(!newStyle[i]){  //老的有，新的没有，就删除这个样式
            el.style[i] = ''
        }
    }

    //新的有，直接用新的去做更新
    let el = vnode.el
    let props = vnode.data || {}   //
    for(let key in props){
        if(key == 'style'){ //{color:red}
            for(let styleName in props.style){
                el.style[styleName] = props.style[styleName]
            }
        }else if(key == 'class'){
            el.className = newProps.class
        }else{
            el.setAttribute(key,props[key])
        }
    }
}

//vue渲染流程
// 初始化数据=>模板进行编译(转为ast树)=>render函数=>生成虚拟节点=>生成真实dom=>替换页面
