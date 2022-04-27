const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` //标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})` // ?:匹配不捕获
const startTagOpen = new RegExp(`^<${qnameCapture}`)  //标签开头的正则，捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) //匹配标签结尾的
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ //匹配属性的
const startTagClose = /^\s*(\/?)>/ //匹配标签结束的
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

export function parseHTML(html){
    function createASTElement(tagName,attrs){
        return { 
            tag:tagName, //标签名
            attrs,  //属性集合
            children:[],  //子节点
            type:1,  //元素类型
            parent:null //父元素
        }
    }
    let root,currentParent; //root 记录根节点，currentParent记录当前元素，作为父节点使用。
    const stack = [] //使用栈结构，清楚父子关系
    function start(tagName,attrs){
        let ast = createASTElement(tagName,attrs)
        if(!root){
            root = ast
        }
        currentParent = ast //记录此时的解析的标签，用于作为父元素使用
        stack.push(ast)
    }
    function end(tagName){
        // <div><p></p>123</div>   stack:[div,p]
        let element = stack.pop() // stack :[div] element:p
        //但是此时的currentParent指向的是p，此时div应该是p的父节点，所以我们要修改currentParent
        currentParent = stack[stack.length-1]
        //这里我们就可以弄清楚节点之间的父子关系
        if(currentParent){
            element.parent = currentParent
            currentParent.children.push(element)
        }
        // console.log(tagName,'---末尾---');
    }
    function chars(text){
        text = text.replace(/\s/g,'') //取消空格
        if(text){
            currentParent.children.push({
                type:3,
                text
            })
        }
    }    
     //只要html不为空就一直解析
     while(html){
         let textEnd = html.indexOf('<')
         if(textEnd == 0){
             //说明此时为标签
            const startTagMatch = parseStartTag() //开始标签返回的结果
            if(startTagMatch){
                start(startTagMatch.tagName,startTagMatch.attrs)
                continue;
            }
            const endTagMatch = html.match(endTag) //如果能匹配到结尾标签
            if(endTagMatch){
                advance(endTagMatch[0].length) //把结尾标签删了
                end(endTagMatch[1])
                continue;
            }
         }
         let text;
         if(textEnd>0){
            //说明此时有文本
            text = html.substring(0,textEnd)
         }
         if(text){
            advance(text.length)
            chars(text)
         }
     }
     //字符串截取操作
     function advance(n){
          html = html.substring(n)
     }
     function parseStartTag(){
        const start = html.match(startTagOpen) //匹配开头的正则
        if(start){
            const match = {
                tagName:start[1],
                attrs:[]
            }
            //此时截取了div这个标签头，截取一点我们就删一点
            advance(start[0].length)
            //截取属性
            // 还有一种情况就是<div/>直接是闭合标签 。 属性可能有多个，我们要使用while不断判断
            let end,attr;
            while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
                // 匹配到的属性可能是 aa = "zz"  也可能是 aa = 'zz'  aa = zz 都有可能，这三种情况分别对应 attr[3] attr[4] attr[5] 
                match.attrs.push({name:attr[1],value:attr[3]||attr[4]||attr[5]})
                advance(attr[0].length) //然后去掉当前属性
            } 
            if(end){
                advance(end[0].length)
                return match
            }
        }
     }
     //match test exec  match是字符串在前面，test,exec是正则在前面
     return root
}