import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'

export default {
    input:'./src/index.js',
    output:{
        format:'umd', //模块化的类型,esm commonjs
        name:'Vue',  //全局变量的名字
        file:'dist/umd/vue.js',
        sourcemap:true  //提供映射表，用于错误比对 
    },
    plugins:[
        babel({
            exclude:'node_modules/**'
        }),
        serve({
            port:3000,
            contentBase:'',
            openPage:'/index.html',
            open:true
        })
    ]
}