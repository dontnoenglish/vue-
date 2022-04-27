import lookup from "./lookup";
import renderTemplate from "./renderTemplate";
/*
    这个函数作用递归调用renderTemplate函数
       这里递归调用的次数，一定要知道。我们是根据数据的长度来进行递归调用，所以我们要遍历数据，从而递归调用
*/

export default function parseArray(token,data){
    //结果字符串
    let resultStr = ''
    //先通过lookup函数拿到该token对应的tokens
    // 这里的data就是一个对象，即student:[{},{}] ,而这里的token[1] 对应的就是student，
    // 这里的 v 就是拿到student这个数组
    let v = lookup(data,token[1])
    // 根据数据的多少进行递归
    for(let i=0 ;i<v.length;i++){
        resultStr += renderTemplate(token[2],{
            ...v[i],
            '.':v[i]
        })
    }
    return resultStr
}
