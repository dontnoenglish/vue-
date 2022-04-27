import transformTokens from './Tokens'
import renderTemplate from './renderTemplate'
import lookup from './lookup'

//提供一个全局的templateEngine对象
window.templateEngine = {
    //渲染方法
    render(str,data){
        //调用transformTokens函数，使得str模板字符串转化为tokens数组
        let tokens = transformTokens(str)
        // console.log(tokens);
        //将tokens数组与数据结合，返回dom字符串
        let resultStr = renderTemplate(tokens,data)
        // console.log(resultStr);
        return resultStr
    }
}
