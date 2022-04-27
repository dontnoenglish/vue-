
export default class Scanner {
    constructor(str){
        this.index = 0
        this.str = str
        //尾巴,一开始则为原字符串
        this.tail = str
    }
    //跳过'{{'，然后更新尾巴tail
    scan(tag){
        if(this.tail.indexOf(tag) == 0){
            //tag有多长，就让指针后移几位，比如'{{',则后移两位
            this.index += tag.length
            //并且更新尾巴
            this.tail = this.tail.substring(this.index)
        }
    }
    //让指针进行扫描，直到遇见'{{'结束,并且能够返回路过的文字
    scanUtil(stopTag){
        //记录一下刚开始的索引，方便后面返回路过的文字
        const index_back = this.index
        //写 && 很有必要，不写会造成死循环
        while(!this.eos() && this.tail.indexOf(stopTag) != 0){
            this.index++
            this.tail = this.str.substring(this.index)
        }
        return this.str.substring(index_back,this.index)
    }
    //判断指针是否到头
    eos(){
        return this.index >= this.str.length
    }
}