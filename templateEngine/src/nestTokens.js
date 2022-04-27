
export default function nestTokens(tokens){
   //结果数组
    var nestedTokens = []
    //栈结构
    var stacks = []
    // 收集器，天生指向结果数组，遇到#之后，指向新的数组
    var collector = nestedTokens
    for(let i =0;i<tokens.length;i++){
        var token = tokens[i]
        switch(token[0]){
            //进栈
            case '#':
                //将当前的token数组添加至收集器
                collector.push(token)
                //进栈
                stacks.push(token)
                //更新收集器
                collector = token[2] = []
                break;
            //出栈
            case '/':
                //弹栈
                stacks.pop()
                //更新收集器
                collector = stacks.length > 0 ? stacks[stacks.length-1][2] : nestedTokens
                break;
            default:
                collector.push(token)
        }
    }
    return nestedTokens
}
