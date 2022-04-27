(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; //标签名

    var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // ?:匹配不捕获

    var startTagOpen = new RegExp("^<".concat(qnameCapture)); //标签开头的正则，捕获的内容是标签名

    var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //匹配标签结尾的

    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性的

    var startTagClose = /^\s*(\/?)>/; //匹配标签结束的
    function parseHTML(html) {
      function createASTElement(tagName, attrs) {
        return {
          tag: tagName,
          //标签名
          attrs: attrs,
          //属性集合
          children: [],
          //子节点
          type: 1,
          //元素类型
          parent: null //父元素

        };
      }

      var root, currentParent; //root 记录根节点，currentParent记录当前元素，作为父节点使用。

      var stack = []; //使用栈结构，清楚父子关系

      function start(tagName, attrs) {
        var ast = createASTElement(tagName, attrs);

        if (!root) {
          root = ast;
        }

        currentParent = ast; //记录此时的解析的标签，用于作为父元素使用

        stack.push(ast);
      }

      function end(tagName) {
        // <div><p></p>123</div>   stack:[div,p]
        var element = stack.pop(); // stack :[div] element:p
        //但是此时的currentParent指向的是p，此时div应该是p的父节点，所以我们要修改currentParent

        currentParent = stack[stack.length - 1]; //这里我们就可以弄清楚节点之间的父子关系

        if (currentParent) {
          element.parent = currentParent;
          currentParent.children.push(element);
        } // console.log(tagName,'---末尾---');

      }

      function chars(text) {
        text = text.replace(/\s/g, ''); //取消空格

        if (text) {
          currentParent.children.push({
            type: 3,
            text: text
          });
        }
      } //只要html不为空就一直解析


      while (html) {
        var textEnd = html.indexOf('<');

        if (textEnd == 0) {
          //说明此时为标签
          var startTagMatch = parseStartTag(); //开始标签返回的结果

          if (startTagMatch) {
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
          }

          var endTagMatch = html.match(endTag); //如果能匹配到结尾标签

          if (endTagMatch) {
            advance(endTagMatch[0].length); //把结尾标签删了

            end(endTagMatch[1]);
            continue;
          }
        }

        var text = void 0;

        if (textEnd > 0) {
          //说明此时有文本
          text = html.substring(0, textEnd);
        }

        if (text) {
          advance(text.length);
          chars(text);
        }
      } //字符串截取操作


      function advance(n) {
        html = html.substring(n);
      }

      function parseStartTag() {
        var start = html.match(startTagOpen); //匹配开头的正则

        if (start) {
          var match = {
            tagName: start[1],
            attrs: []
          }; //此时截取了div这个标签头，截取一点我们就删一点

          advance(start[0].length); //截取属性
          // 还有一种情况就是<div/>直接是闭合标签 。 属性可能有多个，我们要使用while不断判断

          var _end, attr;

          while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            // 匹配到的属性可能是 aa = "zz"  也可能是 aa = 'zz'  aa = zz 都有可能，这三种情况分别对应 attr[3] attr[4] attr[5] 
            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5]
            });
            advance(attr[0].length); //然后去掉当前属性
          }

          if (_end) {
            advance(_end[0].length);
            return match;
          }
        }
      } //match test exec  match是字符串在前面，test,exec是正则在前面


      return root;
    }

    function _typeof(obj) {
      "@babel/helpers - typeof";

      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      }, _typeof(obj);
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }

    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }

    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function _iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;

      var _s, _e;

      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;

      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

      return arr2;
    }

    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

    function genProps(attrs) {
      var str = '';

      for (var i = 0; i < attrs.length; i++) {
        var attr = attrs[i]; //如果style类型的话需要做单独处理。因为style对应的可能会有多个。但普通的其他属性都是一对一。

        if (attr.name == 'style') {
          (function () {
            var obj = {}; // style='border: 12;color: 21;' style可能对应的是这种。

            attr.value.split(';').forEach(function (item) {
              var _item$split = item.split(':'),
                  _item$split2 = _slicedToArray(_item$split, 2),
                  key = _item$split2[0],
                  value = _item$split2[1];

              obj[key] = value;
            });
            attr.value = obj;
          })();
        } //其他属性对应的键和值直接拼接就可以。 这里因为对style的做了单独的处理，使得attr.value为对象。所以这里读的话要使用
        // JSON.stringify


        str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ","); //每个属性后面加个 , 做分割
      }

      return "{".concat(str.slice(0, -1), "}"); //返回一个 `{}` 这种类型字符串，并且去掉str中最后一个 , 
    }

    function gen(node) {
      //元素节点
      if (node.type == 1) {
        return generate(node);
      } //文本节点


      if (node.type == 3) {
        var text = node.text; //有两种情况，一种是普通文本，一种是带 {{}}的mustache语法 

        if (!defaultTagRE.test(text)) {
          return "_v(".concat(JSON.stringify(text), ")");
        } //上面使用test检测有个问题，就是检测一次过后，lastIndex就会向后推，后面再检测就有可能出问题
        //所以每次检测完，就把lastIndex重置为0


        var lastIndex = defaultTagRE.lastIndex = 0;
        var tokens = []; //存放每一段的代码

        var match, index; //match是每次匹配的结果，index为截取的最后一个索引

        while (match = defaultTagRE.exec(text)) {
          index = match.index; //slice方法，截取包括结束位置的字符，substring不包括结束位置

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          } //match[0]为匹配到的 {{xxx}}  ,match


          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        } //如果此时的最后的索引还小于文本的长度，说明后面还有文字内容


        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")");
      } //slice substring substr
      //exec match test   match是字符串在前，其他两个方法是正则在前

    }

    function genChildren(node) {
      var children = node.children;

      if (children) {
        //将转化后的所有儿子用逗号拼接起来
        return children.map(function (child) {
          return gen(child);
        }).join(',');
      }
    }

    function generate(ast) {
      var children = genChildren(ast);
      var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length ? "".concat(genProps(ast.attrs)) : "undefined").concat(children ? ",".concat(children) : '', ")");
      return code;
    }

    function compileToFunctions(template) {
      /*
      这里要将template dom结构转化为render函数，肯定不能直接转化.要通过 ast语法树
      ast语法树与虚拟dom的区别。
      虚拟dom是用对象的形式描述节点。ast语法树也可以用对象的方式描述节点，但ast语法树用来描述语言本身。
      它也可以用来描述 const a = 1; 这样一句代码。
      总结：ast语法树是对原生语法的描述。虚拟dom是对dom节点的描述。共同点都是以对象的形式描述。
      */
      //1.将template转化为ast语法树
      var ast = parseHTML(template); //2.优化静态节点
      //通过ast树，生成code代码
      // _c就是新的节点。 _v就是文本  _s是mustache语法中的变量 
      // _c('div',{id:"app",aa:"12",style:{"border":" 12","color":" 21"}},_v("123"+_s(哈哈哈)+_s(msg)+"987"),_c(span,undefined,_v("321")))
      //3.通过generate函数生成上述代码

      var code = generate(ast); //生成的代码中的mustache中的变量怎么获得呢？这里取不到vm。 在此使用with语法
      //使用with语法，我们在使用render函数时，让其内部this指向vm即可拿到data中的变量
      //4.将字符串变成函数

      var render = new Function("with(this){return ".concat(code, "}"));
      return render;
    }

    var id$1 = 0;

    var Dep = /*#__PURE__*/function () {
      function Dep() {
        _classCallCheck(this, Dep);

        this.subs = [];
        this.id = id$1++;
      }

      _createClass(Dep, [{
        key: "depend",
        value: function depend() {
          //  this.subs.push(Dep.target)  将watcher加入subs数组中
          Dep.target.addDep(this); //实现双向记忆，watcher记住dep的同时，dep也记住watcher
        }
      }, {
        key: "addSub",
        value: function addSub(watcher) {
          this.subs.push(watcher);
        }
      }, {
        key: "notify",
        value: function notify() {
          this.subs.forEach(function (watcher) {
            return watcher.update();
          });
        }
      }]);

      return Dep;
    }();

    Dep.target = null;
    function pushTarget(watcher) {
      Dep.target = watcher;
    }
    function popTarget() {
      Dep.target = null;
    }
     //每个属性都对应一个dep，dep是用来收集watcher的

    var id = 0;

    var Watcher = /*#__PURE__*/function () {
      function Watcher(vm, exprOrFn, cb, options) {
        _classCallCheck(this, Watcher);

        this.vm = vm;
        this.exprOrFn = exprOrFn; //数据驱动页面重新渲染的render函数

        this.cb = cb;
        this.options = options;
        this.id = id++; //watcher的唯一标识

        this.deps = []; //watcher记录有多少哥dep依赖他

        this.depsId = new Set();

        if (typeof exprOrFn == 'function') {
          this.getter = exprOrFn;
        }

        this.get();
      }

      _createClass(Watcher, [{
        key: "addDep",
        value: function addDep(dep) {
          var id = dep.id;

          if (!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.push(id);
            dep.addSub(this);
          }
        }
      }, {
        key: "get",
        value: function get() {
          pushTarget(this); //当前watcher实例

          this.getter();
          popTarget();
        }
      }, {
        key: "run",
        value: function run() {
          this.get();
        }
      }, {
        key: "update",
        value: function update() {
          // this.get() //重新渲染
          //这里不要频繁的渲染，也就是我们需要异步更新
          queueWatcher(this);
        }
      }]);

      return Watcher;
    }();

    var queue = [];
    var has = {};
    var pending = false;

    function queueWatcher(watcher) {
      var id = watcher.id;

      if (has[id] == null) {
        //用id标注watcher，用于去重
        queue.push(watcher);
        has[id] = true;

        if (!pending) {
          pending = true;
          setTimeout(function () {
            queue.forEach(function (watcher) {
              return watcher.run();
            });
            queue = [];
            has = {};
            pending = false;
          });
        }
      }
    }

    function patch(oldVnode, vnode) {
      //我们要使用虚拟dom节点(vnode)替换oldVnode
      var dom = createEle(vnode); //产生真正的dom节点

      var parentEle = oldVnode.parentNode; //获取老的节点的父节点 也就是body

      parentEle.insertBefore(dom, oldVnode.nextSibling); //将真实dom节点插入body中

      parentEle.removeChild(oldVnode); //删除老的节点

      return dom;
    }

    function createEle(vnode) {
      var tag = vnode.tag,
          children = vnode.children;
          vnode.key;
          vnode.data;
          var text = vnode.text;

      if (typeof tag == 'string') {
        //元素节点
        vnode.el = document.createElement(tag); //只有元素节点有属性,将属性添加至vdom上

        updateProperties(vnode);
        children.forEach(function (child) {
          //遍历儿子，将儿子渲染后的结果仍到父级中。会有很多个层级的嵌套，使用递归。
          vnode.el.appendChild(createEle(child));
        });
      } else {
        //文本节点
        vnode.el = document.createTextNode(text);
      }

      return vnode.el;
    }

    function updateProperties(vnode) {
      var el = vnode.el;
      var props = vnode.data || {}; //

      for (var key in props) {
        if (key == 'style') {
          //{color:red}
          for (var styleName in props.style) {
            el.style[styleName] = props.style[styleName];
          }
        } else if (key == 'class') {
          el.className = el["class"];
        } else {
          el.setAttribute(key, props[key]);
        }
      }
    } //vue渲染流程
    // 初始化数据=>模板进行编译(转为ast树)=>render函数=>生成虚拟节点=>生成真实dom=>替换页面

    function lifecycleMixin(Vue) {
      Vue.prototype._update = function (vnode) {
        //将虚拟节点转化为真实节点
        var vm = this;
        vm.$el = patch(vm.$el, vnode); //用返回的新的节点替换原有的
      };
    }
    function mountComponent(vm, el) {
      vm.$el = el; //调用render方法，去渲染el

      callHook(vm, 'beforeMount'); //先调用render方法创建虚拟节点(render)，再将虚拟节点渲染(update)到真实el上。每次数据更新都得掉这两个方法
      // vm._update(vm._render())  

      var updateComponent = function updateComponent() {
        return vm._update(vm._render());
      };

      new Watcher(vm, updateComponent, function () {
        callHook(vm, 'beforeUpdate');
      });
      callHook(vm, 'mounted');
    } // callHook(vm,'beforeCreate')

    function callHook(vm, hook) {
      var handlers = vm.$options[hook]; //vm.$options.created = [a1,a2]

      if (handlers) {
        for (var i = 0; i < handlers.length; i++) {
          handlers[i].call(vm);
        }
      }
    }

    //拿到数组原型上原来的方法
    var oldArrayPrototypeMethods = Array.prototype;
    var arrayMethods = Object.create(oldArrayPrototypeMethods);
    var methods = ['pop', 'shift', 'push', 'unshift', 'reverse', 'splice', 'sort'];
    methods.forEach(function (method) {
      arrayMethods[method] = function () {
        console.log('数组方法被调用了');

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var result = oldArrayPrototypeMethods[method].apply(this, args);
        var inserted; //这里的this是谁？  谁调用了这些方法，this就是谁。 也就是Observe类中的value

        var ob = this.__ob__; //使用添加的方法，往数组中添加对象，任然做不到响应式。所以我们就对添加的对象添加响应式。

        switch (method) {
          case 'push': //arr.push({a:1},{b:2}) 仍然做不到响应式

          case 'unshift':
            //arr.unshift({a:1},{b:2})  同理
            inserted = args;

          case 'splice':
            //arr.splice(0,0,{a:1}) 使用splice新增的话，新增的参数为args的第三个参数
            inserted = args.slice(2);
        } //如果添加了，就对添加的数组中的对象添加响应式


        if (inserted) ob.observeArray(inserted);
        ob.dep.notify(); //使用方法进行修改值时，让watcher更新

        return result;
      };
    });

    var Observer = /*#__PURE__*/function () {
      function Observer(value) {
        _classCallCheck(this, Observer);

        this.dep = new Dep(); //给对数据劫持的value添加一个标记，只要有 __ob__就说明被监测过

        Object.defineProperty(value, '__ob__', {
          enumerable: false,
          //不能被枚举，也就是不能被循环遍历出来
          configurable: false,
          //不可以修改，不可以删除
          //将当前的实例定义到value上。这样 array.js才能使用 Class Observer上的原型方法，也就是walk,observerArray这两个方法。value这里被定义为当前实例
          value: this
        }); //使用defineProperty数据劫持
        // 如果是数组的话就不要进行劫持，性能太差。我们这边只要重写能够改变数组本身的方法即可

        if (Array.isArray(value)) {
          // pop shift push unshift splice sort reverse
          //将arrayMethods作为value的原型   等同于 value.__proto__ = arrayMethods
          Object.setPrototypeOf(value, arrayMethods); //此时只是对Array中的方法做了劫持，如果数组中有对象则依然劫持不到

          this.observeArray(value); //我们使用observeArray进行对数组中的对象进行劫持，数组中的普通类型是不做观测的
        } else {
          this.walk(value);
        }
      }

      _createClass(Observer, [{
        key: "walk",
        value: function walk(data) {
          var keys = Object.keys(data);
          keys.forEach(function (key) {
            defineReactive(data, key, data[key]);
          });
        }
      }, {
        key: "observeArray",
        value: function observeArray(value) {
          value.forEach(function (item) {
            observe(item);
          });
        }
      }]);

      return Observer;
    }();

    function defineReactive(data, key, value) {
      var childOb = observe(value); // 用于给深层次的对象添加响应式。没有这一行的话，只能给第一层对象添加响应式

      var dep = new Dep(); //每个属性都对应一个dep

      Object.defineProperty(data, key, {
        // 获取值
        get: function get() {
          //获取数据的时候，我们让当前watcher加入subs数组中
          if (dep.target) {
            dep.depend();

            if (childOb) {
              //可能是数组也可能是对象
              childOb.dep.depend(); //数组存起来这个渲染的watcher。等触发的时候调用
            }
          }

          return value;
        },
        //修改值
        set: function set(newValue) {
          if (newValue == value) return; //如果用户将值修改为对象的话，继续监控

          observe(newValue); //observe函数中有数据类型判断

          value = newValue; //属性变化的时候，通知watcher更新

          dep.notify();
        }
      });
    }

    function observe(data) {
      //这里做一个条件判断，方便后面递归给深层次的对象添加响应式
      if (_typeof(data) != 'object' || data == null) {
        return;
      } //如果数据上游__ob__，说明已经被劫持过，直接返回就行。


      if (data.__ob__) {
        return data;
      }

      return new Observer(data);
    }

    function proxy(vm, data, key) {
      Object.defineProperty(vm, key, {
        get: function get() {
          console.log(vm, data, key);
          return vm[data][key];
        },
        set: function set(newValue) {
          vm[data][key] = newValue;
        }
      });
    }
    var strats = {};

    strats.data = function (parentVal, childVal) {
      return childVal; //这里有合并data的策略
    }; // strats.computed = function (){}
    // strats.watch = function (){}


    var LIFECYCLE_HOOKS = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'update', 'beforeDestroy', 'destroyed']; //这个函数就能体现出生命周期的原理。采用数组的方法，将所有生命周期函数压进去，合适的时候调用

    function mergeHook(parentVal, childValue) {
      //声明周期的合并
      if (childValue) {
        if (parentVal) {
          return parentVal.concat(childValue); //爸爸和儿子进行合并
        } else {
          return [childValue]; //儿子需要转化为数组
        }
      } else {
        return parentVal; //直接用父亲的
      }
    }

    LIFECYCLE_HOOKS.forEach(function (hook) {
      strats[hook] = mergeHook;
    });
    function mergeOptions() {
      var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var child = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      //遍历父亲，可能父亲有，可能儿子有
      var options = {};

      for (var key in parent) {
        //父亲和儿子都有，就在这处理
        mergeField(key);
      }

      for (var _key in child) {
        //儿子有，父亲没有
        if (!parent.hasOwnProperty(_key)) {
          mergeField(_key);
        }
      }

      function mergeField(key) {
        //合并字段
        if (strats[key]) {
          options[key] = strats[key](parent[key], child[key]);
        } else {
          options[key] = child[key];
        }
      }

      return options;
    }

    function initState(vm) {
      var opts = vm.$options;

      if (opts.props) ; // if(opts.data){


      initData(vm); // }

      if (opts.methods) ;

      if (opts.computed) ;
    }


    function initData(vm) {
      var data = vm.$options.data; //这里的data有可能是箭头函数，有可能是对象。如果是箭头函数的话，那他的this就不会指向vm，所以我们要使用call改变this指向

      vm._data = data = typeof data == 'function' ? data.call(vm) : data; //此时data就肯定是一个对象了
      //当我去vm上面取data中的数据，不再是vm._data.xxx  而是直接vm.xxx 。此时，我们就需要代理

      for (var key in data) {
        proxy(vm, '_data', key);
      } //接下来，我们就要对data这个对象进行一个数据劫持


      observe(data);
    }

    /*
        提供初始化操作
    */

    function init(Vue) {
      //全局组件和局部组件的区别
      //全局组件会在vue的初始化的时候将当前组件合并到全局上去
      Vue.prototype._init = function (options) {
        var vm = this; // vm.$options = options

        vm.$options = mergeOptions(vm.constructor.options, options); //将用户自定义的options和全局的options合并
        //初始化状态 比如methods  computed  props  data

        callHook(vm, 'beforeCreate'); //调声明周期函数

        initState(vm); //初始化数据之前，调用 'beforeCreate' ,初始化数据后 'created'

        callHook(vm, 'created'); //进行挂载

        if (vm.$options.el) {
          vm.$mount(vm.$options.el);
        }
      };

      Vue.prototype.$mount = function (el) {
        //挂载操作
        //挂载操作的优先级  render>template>el == $mount
        var vm = this;
        var options = vm.$options;
        el = document.querySelector(el);
        vm.$el = el;

        if (!options.render) {
          //没有render，就要将template转化成render
          var template = options.template;

          if (!template && el) {
            template = el.outerHTML;
          } //将模板字符串转换为render函数


          var render = compileToFunctions(template);
          options.render = render; //最终渲染的时候，都是使用render方法
        } //需要挂载el对应的组件


        mountComponent(vm, el);
      };
    }

    function renderMixin(Vue) {
      Vue.prototype._c = function () {
        //创建虚拟元素(vnode)
        return createElement.apply(void 0, arguments);
      };

      Vue.prototype._s = function (val) {
        // 代表mustache中的变量
        return val == null ? '' : _typeof(val) == 'object' ? JSON.stringify(val) : val;
      };

      Vue.prototype._v = function () {
        //创建虚拟文本节点
        return createText.apply(void 0, arguments);
      };

      Vue.prototype._render = function () {
        var vm = this;
        var render = vm.$options.render;
        var vnode = render.call(vm);
        return vnode;
      };
    }

    function createElement(tag) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        children[_key - 2] = arguments[_key];
      }

      return vnode(tag, data, data.key, children);
    }

    function createText(text) {
      return vnode(undefined, undefined, undefined, undefined, text);
    } //用来产生虚拟dom


    function vnode(tag, data, key, children, text) {
      return {
        tag: tag,
        data: data,
        key: key,
        children: children,
        text: text
      };
    }

    /*
       这里为什么不用class，而是用function呢，因为我们后续的操作大多数要往vue的原型上加方法，
       而class往原型上加方法，要在class类中写，而function则直接在prototype上加就行。vue源码也是如此
    */

    function Vue(options) {
      this._init(options);
    }

    init(Vue); //挂载操作

    lifecycleMixin(Vue); // _update

    renderMixin(Vue); // _render

    return Vue;

}));
//# sourceMappingURL=vue.js.map
