const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
function genProps(attrs){
    let str = ''
    for(let i=0;i<attrs.length;i++){
        let attr = attrs[i]
        //如果style类型的话需要做单独处理。因为style对应的可能会有多个。但普通的其他属性都是一对一。
        if(attr.name == 'style'){
            let obj = {}
            // style='border: 12;color: 21;' style可能对应的是这种。
            attr.value.split(';').forEach(item=>{
                let [key,value] = item.split(':')
                obj[key] = value
            })
            attr.value = obj
        }
        //其他属性对应的键和值直接拼接就可以。 这里因为对style的做了单独的处理，使得attr.value为对象。所以这里读的话要使用
        // JSON.stringify
        str += `${attr.name}:${JSON.stringify(attr.value)},` //每个属性后面加个 , 做分割
    }
    return `{${str.slice(0,-1)}}` //返回一个 `{}` 这种类型字符串，并且去掉str中最后一个 , 
}

function gen(node){
    //元素节点
    if(node.type == 1){
        return generate(node)
    }
    //文本节点
    if(node.type == 3){
        let text = node.text
        //有两种情况，一种是普通文本，一种是带 {{}}的mustache语法 
        if(!defaultTagRE.test(text)){  
            return `_v(${JSON.stringify(text)})`
        } 
        //上面使用test检测有个问题，就是检测一次过后，lastIndex就会向后推，后面再检测就有可能出问题
        //所以每次检测完，就把lastIndex重置为0
        let lastIndex = defaultTagRE.lastIndex = 0
        let tokens = [] //存放每一段的代码
        let match,index  //match是每次匹配的结果，index为截取的最后一个索引
        while(match = defaultTagRE.exec(text)){
            index = match.index
            //slice方法，截取包括结束位置的字符，substring不包括结束位置
            if(index>lastIndex){
                tokens.push(JSON.stringify(text.slice(lastIndex,index))) 
            } 
            //match[0]为匹配到的 {{xxx}}  ,match
            tokens.push(`_s(${match[1].trim()})`)
            lastIndex = index + match[0].length
        }
        //如果此时的最后的索引还小于文本的长度，说明后面还有文字内容
        if(lastIndex<text.length){
            tokens.push(JSON.stringify(text.slice(lastIndex)))
        }
        return `_v(${tokens.join('+')})`
    }
    //slice substring substr
    //exec match test   match是字符串在前，其他两个方法是正则在前
}

function genChildren(node){
    let children = node.children
    if(children){//将转化后的所有儿子用逗号拼接起来
        return children.map(child=>gen(child)).join(',')
    }
}

export function generate(ast){
    let children = genChildren(ast)
    let code = `_c('${ast.tag}',${
        ast.attrs.length ? `${genProps(ast.attrs)}`:`undefined`
    }${
        children?`,${children}`:''
    })`
    return code
}