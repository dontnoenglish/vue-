/*
    这个函数的作用是 
        将data数据中循环嵌套的数据给读出来并返回
*/

export default function lookup(data,str){
    //先看str中有没有 '.' 符号
     if(str.indexOf('.') != -1 && str != '.'){
        //  debugger
        let keys = str.split('.')
          return keys.reduce((pre,cur)=>{
            return pre[cur]
          },data)
     }
     //如果没有 '.' 符号
    return data[str]
}