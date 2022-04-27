import { parseHTML } from "./parse";
import { generate } from './generate'

export function compileToFunctions(template){
    /*
    这里要将template dom结构转化为render函数，肯定不能直接转化.要通过 ast语法树
    ast语法树与虚拟dom的区别。
    虚拟dom是用对象的形式描述节点。ast语法树也可以用对象的方式描述节点，但ast语法树用来描述语言本身。
    它也可以用来描述 const a = 1; 这样一句代码。
    总结：ast语法树是对原生语法的描述。虚拟dom是对dom节点的描述。共同点都是以对象的形式描述。
    */
    //1.将template转化为ast语法树
    let ast = parseHTML(template)
    //2.优化静态节点


    //通过ast树，生成code代码
    // _c就是新的节点。 _v就是文本  _s是mustache语法中的变量 
    // _c('div',{id:"app",aa:"12",style:{"border":" 12","color":" 21"}},_v("123"+_s(哈哈哈)+_s(msg)+"987"),_c(span,undefined,_v("321")))
    //3.通过generate函数生成上述代码
    let code = generate(ast)
    //生成的代码中的mustache中的变量怎么获得呢？这里取不到vm。 在此使用with语法
    //使用with语法，我们在使用render函数时，让其内部this指向vm即可拿到data中的变量
    //4.将字符串变成函数
    let render = new Function(`with(this){return ${code}}`)
    return render
}