import Scanner from "./Scanner";
import nestTokens from "./nestTokens";

export default function transformTokens(str){
    let scanner = new Scanner(str)
    let result = []
    let words
    //检测指针是否到头
    while(!scanner.eos()){
        words = scanner.scanUtil('{{')
        if(words != ''){
            result.push(['text',words])
        }
        scanner.scan('{{')
        //收集{{之后 }}之前的文字
        words = scanner.scanUtil('}}')
        if(words != ''){
            if(words[0] == '#'){
                result.push(['#',words.substring(1)])
            }else if(words[0] == '/'){
                result.push(['/',words.substring(1)])
            }else{
                result.push(['name',words])
            }
        }
        scanner.scan('}}')
    }
    return nestTokens(result)
}