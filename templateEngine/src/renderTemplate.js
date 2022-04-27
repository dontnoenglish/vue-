import lookup from "./lookup"
import parseArray from './parseArray'
/*
   这个函数的作用是将tokens数组与数据结合，转化为dom字符串
*/
export default function renderTemplate(tokens,data){
    //结果字符串
    let resultStr = ''
    //
    for(let i =0;i<tokens.length;i++){
        let token = tokens[i]
        //如果为text，则将后面的直接添加至结果字符串
        if(token[0] == 'text'){
            resultStr += token[1]
            //为 name ，防止出现 'a.b.c'这种情况，我们使用lookup函数
        }else if(token[0] == 'name'){
            resultStr += lookup(data,token[1])
            //为 '#' ，说明有嵌套，使用递归
        }else if(token[0] == '#'){
            resultStr += parseArray(token,data)
        }
    }
    return resultStr
}
