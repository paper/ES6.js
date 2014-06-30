/**
  说明：
  1. 只针对高级浏览器
  2. 不会做很复杂的判断用户输入
*/

var ES6 = {}

/**
  ------------------------------------------------------------------------
  base 
  一些会用到的基础函数 
  
  1. type
  2. object keys
  --------------------------------------------------------------------------
*/

ES6._TYPE = ["String", "Number", "Function", "Boolean", "Object", "Array"];
ES6._TYPE.forEach(function(v){
  ES6["is" + v] = function(para){
    return Object.prototype.toString.call(para) == "[object "+ v +"]";
  }
});

Object.prototype.keys = function(){
  if( !ES6.isObject(this) ) return false;
  
  var keys = [];
  
  for(var key in this){
    // or => Object.prototype.hasOwnProperty.call(this, key)
    if( this.hasOwnProperty(key) ){
      keys.push(key);
    }
  }
  
  return keys;
}

/**
  ------------------------------------------------------------------------
  字符串的扩展  

  1. contains(), startsWith(), endsWith()
  2. repeat()
  3. template string
  --------------------------------------------------------------------------
*/

String.prototype.contains = function(str, atIndex){
  atIndex = atIndex || 0;

  return this.indexOf(str, atIndex) > -1;
}

String.prototype.startsWith = function(str, atIndex){
  atIndex = atIndex || 0;
  var index = this.indexOf(str, atIndex);

  return index === atIndex;
}

// endsWith的行为与其他两个方法有所不同。
// 它针对前n个字符，而其他两个方法针对从第n个位置直到字符串结束。
String.prototype.endsWith = function(str, atIndex){
  var thisLen = this.length;
  var strLen = str.length;

  atIndex = atIndex || 0;

  if( atIndex != 0 ){
    atIndex = thisLen - atIndex;
  }

  return this.startsWith(str, thisLen - atIndex - strLen);
}

String.prototype.repeat = function(num){
  var n = parseInt(+num, 10),
      intReg = /^\d+$/,
      i = 0,
      result = "";
      
  if( intReg.test(n) && n > 0 ){
    for(; i<n; i++){
      result += this;
    }
  }

  return result;
}

/**
  var name = "Bob", time = "today";
  var r = ES6.templateString('Hello ${name}, how are you ${time}?');

  这种太难实现
  因为字符串里面的 name, time 不知道是取局部变量的，还是全局变量的。
  比如：

  var name = "paper", time = "tomorrow";
  ;(function(){
    var name = "Bob", time = "today";
    var r = ES6.templateString('Hello ${name}, how are you ${time}?');
  })()

  r 应该返回的是：Hello Bob, how are you today?'
  怎么才能让 templateString 函数取局部变量的值呢？？

  -----------------------------------------

  所以目前的API是：
  var name = "Bob", time = "today";
  var r1 = ES6.templateString({
    name : name,
    time : time
  },'Hello ${name}, how are you ${time}?');
  => 'Hello Bob, how are you today?'

  //运算不支持"字符串拼接" 
  var x = 1, y = 2;
  var r2 = ES6.templateString({
    x : x,
    y : y
  },'${ x } + ${ y } = ${ x + y }');
  => 1 + 2 = 3
*/
ES6.templateString = function(data, ts){
  var reg = /\${([^${}]+)}/g,
      r = ts.match(reg),
      result = ts;

  if( r == null ) return result;

  result = ts.replace(reg, function(x, y){
    try{
      y = y.trim();
      var value = data[y];

      if( value == undefined ){
        var keys = data.keys();
        var keysStr = keys.join('|');
        var keysReg = new RegExp('('+ keysStr +')(?=[^\\w$])', "g");
        
        var c = (y + ' ').replace(keysReg, function(a){
          return data[a];
        });

        return eval(c);
      }else{
        return value;
      }
    }catch(e){
      return x;
    }
  });

  return result;

}

/**
  ------------------------------------------------------------------------
  数值的扩展  

  1. 二进制和八进制表示法
  2. Number.isFinite(), Number.isNaN()
  3. Number.parseInt(), Number.parseFloat()
  4. Number.isInteger()和安全整数
  --------------------------------------------------------------------------
*/

// Number.parse("0b111110111") === 503   //true
// Number.parse("0o767") === 503         // true
Number.parse = function(str){
  var preData = {
        "0b" : 2,
        "0o" : 8,
        "0x" : 16
      },
      len = str.length,
      preStr = str.slice(0,2),
      lastStr = str.slice(2, len);
      
  if( preData[preStr] ){
    return parseInt(lastStr, preData[preStr]);
  }else{
    return parseInt(str, 10);
  }
}

// 实测是返回undefined，不是false。但文档说的确是false
// => http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isfinite
Number.isFinite = function(n){
  if( !ES6.isNumber(n) ) return false;
  return isFinite(n);
}

Number.isNaN = function(n){
  if( !ES6.isNumber(n) ) return false;
  return isNaN(n);
}

Number.parseInt = function(n, ary){
  return parseInt(n, ary);
}

Number.parseFloat = function(n){
  return parseFloat(n);
}

Number.isInteger = function(n){
  if( !ES6.isNumber(n) || Number.isNaN(n) ) return false;
  
  return n === parseInt(n, 10);
}

Number.MAX_SAFE_INTEGER = Math.pow(2,53) - 1;

Number.MIN_SAFE_INTEGER = -Math.pow(2,53) + 1;

Number.isSafeInteger = function(n){
  if( !Number.isInteger(n)
      || n < Number.MIN_SAFE_INTEGER
      || n > Number.MAX_SAFE_INTEGE ) return false;
  
  return true;
}


/**
  ------------------------------------------------------------------------
  数组的扩展  

  1. Array.from()
  2. Array.of()
  3. 数组实例的find()和findIndex()
  4. 数组实例的fill()
 *5. 数组实例的entries()，keys()和values() -> 返回一个遍历器 (不好搞)
 *6. 数组推导 (不好搞)
 *7. Array.observe()，Array.unobserve()
     -> https://github.com/mennovanslooten/Observable-Arrays/blob/master/js/underscore.observable.js
  --------------------------------------------------------------------------
*/

Array.from = function(arrLike, cb){
  var result = Array.prototype.slice.call(arrLike);
  
  return ES6.isFunction(cb) ? result.map( cb ) : result;
}

Array.of = function(){
  var result = [];
  var argArr = Array.from(arguments);
  
  argArr.forEach(function(v){
    result.push( v );
  });
  
  return result;
}

Array.prototype.findIndex = function(cb, thisArg){
  thisArg = thisArg || null;
  
  for(var i = 0, len = this.length; i<len; i++){
    if( cb.call(thisArg, this[i], i, this) === true ){
      return i;
    }
  }
  
  return -1;
}

Array.prototype.find = function(cb, thisArg){
  var index = this.findIndex(cb, thisArg);
  return index === -1 ? undefined : this[index];
}

Array.prototype.fill = function(n, begin, end){
  var result = this.concat();
  var len = result.length;
  
  begin = typeof begin == "undefined" ? 0 : begin;
  end = typeof end == "undefined" ? len : end;
  
  if(begin < 0){ begin = len + begin; }
  if(end < 0){ end = len + end; }
  
  for(var i = begin; i < end ; i++){
    result[i] = n;
  }
  
  return result;
}


/**
  ------------------------------------------------------------------------
  对象的扩展  

  1. Object.is()
  2. Object.assign()
 *3. proto属性，Object.setPrototypeOf()，Object.getPrototypeOf()
 *4. 增强的对象写法
 *5. 属性名表达式
 *6. Symbol (ruby也有一个Symbol，不要搞混淆)
 *7. Proxy
 *8. Object.observe()，Object.unobserve() -> 看 Array.observe()
  --------------------------------------------------------------------------
*/

Object.is = function(a, b){
  // 有一个 +0 , 有一个 -0
  if( a === 0 && b === 0 && 1/a !== 1/b ){
    return false;
  }
  
  //a=NaN, b=NaN
  if( Number.isNaN(a) && Number.isNaN(b) ){
    return true;
  }
  
  return a === b;
}

Object.assign = function(){
  var args = Array.from(arguments);
  var target = args[0];
  var obj = null;
  
  for( var i = 1, len = args.length; i < len; i++ ){
    obj = args[i];
    
    //将源对象（source）的所有可枚举属性
    for(var key in obj){
      target[key] = obj[key];
    }
  }
  
  return target;
}

//伪 Symbol :D
ES6.Symbol = (function(){

  function getRandomStr(){
    var ran = Math.random() + "";
    return ran.slice(2);
  }
  
  return function(name){
    var now = +new Date(),
        ran1 = getRandomStr(),
        ran2 = getRandomStr(),
        ran3 = getRandomStr();
    
    var result = {
      toString : function(){
        return "symbol_" + now + ran1 + ran2 + ran3;
      }
    }
    
    if( ES6.isString(name) ){
      result.name = name;
    }

    return result;
  }
})();


/**
  ------------------------------------------------------------------------
  函数的扩展  

 *1. 函数参数的默认值
 *2. rest参数
 *3. 扩展运算符
  4. 箭头函数
  --------------------------------------------------------------------------
*/

/*
  模拟箭头函数
  
  var f1 = v => v
  var f1 = ES6.arrow('v => v')

  var f2 = () => 5
  var f2 = ES6.arrow('() => 5')

  var sum1 = (num1, num2) => num1 + num2
  var sum1 = ES6.arrow('(num1, num2) => num1 + num2')

  var sum2 = (num1, num2) => { return num1 + num2; }
  var sum2 = ES6.arrow('(num1, num2) => { return num1 + num2; }')

  var getTempItem = id => ({ id: id, name: "Temp" })
  var getTempItem = ES6.arrow('id => ({ id: id, name: "Temp" })')

  [1,2,3].map(x => x * x)
  [1,2,3].map( ES6.arrow('x => x * x') )

  var result = values.sort((a, b) => a - b)
  var result = values.sort(ES6.arrow('(a, b) => a - b'))
  
  -----------------------------------
  
  其实箭头还可以嵌套的：
  var f3 = v => v => v
  等价于
  var f3 = function(v){
    return function(v){
      return v;
    }
  }
  
  这个稍微复杂一点（多了递归），后续有可能会添加这个功能，目前暂不支持。
  
*/
ES6.arrow = function( arrowStr ){
  var arrowKey = '=>',
      temp = arrowStr.split(arrowKey),
      
      leftArrowStr = temp[0].trim(),
      rightArrowStr = temp[1].trim(),
      
      funcPara = leftArrowStr.startsWith("(")  ? leftArrowStr : "(" + leftArrowStr + ")",
      funcBody = rightArrowStr.startsWith("{") ? rightArrowStr.match(/{([^{}]*)}/)[1] : "return " + rightArrowStr + ";",
      
      funcName = ES6.Symbol() + "";
   
  var fnStr = ES6.templateString({
            funcPara : funcPara,
            funcBody : funcBody,
            funcName : funcName
          },'function ${funcName}${funcPara}{ ${funcBody} }');

  eval(fnStr);
  
  return eval(funcName);
}


/**
  ------------------------------------------------------------------------
  Set和Map数据结构  

  1. Set
  2. Map
 *3. WeakMap
  --------------------------------------------------------------------------
*/


/*
  原生浏览器（FF 30.0）测试：
  //认为 NaN NaN 相同(Object.is)
  var items = new Set([1,2,3,4,NaN,NaN]);
  items.size => 5
  
  //认为 -0, +0 相同(===)
  var items = new Set([1,2,3,4,-0,+0]);
  items.size => 5
  
  //认为 {a:1}, {a:1} 不同(===)
  var items = new Set([1,2,3,4,{a:1},{a:1}]);
  items.size => 6
  
  所以目前的测试结论很有可能是：
  Set判断元素唯一，使用 === 判断，但NaN和NaN还是使用Object.is
  
*/

ES6.Set = function(arr){
  this._data = [];
  this.size = 0;
  
  if( ES6.isArray(arr) ){
    var tempArr;
    
    for( var i = 0, len = arr.length; i < len ;i++ ){
      tempArr = arr[i];
      
      if( !this.has(tempArr) ){
        this._data.push(tempArr);
      }
    }
  }
  this._setSize();
}

ES6.Set.prototype = {
  
  _setSize : function(){
    this.size = this._data.length;
  },
  
  _find : function(value){
    var i = 0,
        data = this._data,
        len = data.length,
        tempData;
    
    for(; i<len; i++){
      tempData = data[i];
      
      if( tempData === value || Object.is( tempData, value ) ){
        return {
          has : true,
          index : i
        }
      }
    }
    
    return false;
  },

  add : function(value){
    
    if( !this.has(value) ){
      this._data.push(value);
    }
    this._setSize();
    
    return this;
  },

  delete : function(value){
    var findValue = this._find(value);
    
    if( !!findValue ){
      var index = findValue.index;
      this._data.splice(index, 1);
      return true;
    }
    this._setSize();
    
    return false;
  },

  has : function(value){
    
    if( !!this._find(value) ){
      return true;
    }
    
    return false;
  },

  clear : function(){
    this._data = [];
    this._setSize();
  }
}

/**
  var m = new ES6.Map();
  
  var o = { a: 1 };
  var r = [1,2];  
  var f = function(){ console.log("fun") };
  
  var n = null;
  var u = undefined;
  var i = 262;
  var s = "edition";
  var b = true;
  
  m.set(o, "I am object")             // 键是 object
  m.set(r, "I am array")              // 键是 array
  m.set(f, "I am function")           // 键是 function
  
  m.set(n, "I am null")               // 键是 null
  m.set(s, "I am string")             // 键是 字符串
  m.set(i, "I am number")             // 键是 数值
  m.set(u, "I am undefined")          // 键是 undefined
  m.set(b, "I am boolean")            // 键是 boolean

  console.log( "m.keys() = ", m.keys() )
  console.log( "m.values() = ", m.values() )
  console.log( "m.entries() = ", m.entries() )
  
  console.log("============= change =============");
  o.b = 2;
  r.push(3);
  
  //值不变
  console.log( "m.entries() = ", m.entries() )
  
  console.log("============= forEach begin =============");
  m.forEach(function(value, key, map){
    console.log(value);
    console.log(key);
    //console.log(map);
  })
  console.log("============= forEach end =============");
*/
ES6.Map = function(arr){
  var self = this;
  
  self._data = {};
  self._trueKeys = [];
  self.size = 0;
  self._secretKey = "_paper_es6_map_secret_key_";
  
  //init
  if( ES6.isArray(arr) ){
    arr.forEach(function(v){
      var key = v[0];
      var value = v[1];
      
      self.set(key, value);
    });
  }
}

ES6.Map.prototype = {
  //前提是key已经不是对象，数组，函数
  _createNewKey : function(key){
    var newKey = "";
    var secretKey = this._secretKey;
    
    if( key === undefined ){
      newKey = "undefined" + secretKey;
    }else if( key === null ){
      newKey = "null" + secretKey;
    }else{
      newKey = key.toString() + Object.prototype.toString.call(key);
    }
    
    return newKey;
  },
  
  _com : function(key, cb1, cb2){
    if( ES6.isObject(key) || ES6.isArray(key) || ES6.isFunction(key)){
      cb1( this._secretKey );
    }else{
      cb2( this._createNewKey(key) );
    }
  },
  
  _setSize : function(){
    this.size = this._trueKeys.length;
  },
  
  //因为在ES5，key只能是字符串
  set : function(key, value){
    var self = this;
    
    self._com(key, function(sk){
      key[sk] = value;
    }, function(newKey){
      self._data[newKey] = value;
    });
    
    self._trueKeys.push( key );
    
    self._setSize();
  },
  
  get : function(key){
    var self = this;
    var value;
    
    self._com(key, function(sk){
      value = key[sk];
    }, function(newKey){
      value = self._data[newKey];
    });
    
    return value;
  },
  
  has : function(key){
    return typeof this.get(key) != "undefined";
  },
  
  delete : function(key){
    var self = this;
    var result = false;
    
    self._com(key, function(sk){
    
      var trueKeys = self._trueKeys.concat();
      
      result = trueKeys.some(function(v, i, arr){
        if( v && v[sk] === key[sk] ){
          self._trueKeys.splice(i, 1);
          delete key[sk];
          return true;
        }
      });
      
    }, function(newKey){
      
      var trueKeys = self._trueKeys.concat();
      
      result = trueKeys.some(function(v, i, arr){
        if( self._createNewKey(v) === newKey ){
          self._trueKeys.splice(i, 1);
          delete self._data[newKey];
          return true;
        }
      });
      
    });
    
    self._setSize();
    
    return result;
  },
  
  clear : function(){
    this._data = {};
    this._trueKeys = [];
    this._setSize();
  },
  
  keys : function(){
    return this._trueKeys;
  },
  
  values : function(){
    var self = this;
    var result = [];
    
    self._trueKeys.forEach(function(v){
      result.push( self.get(v) );
    });
    
    return result;
  },
  
  entries : function(){
    var self = this;
    var result = [];
    
    self._trueKeys.forEach(function(key){
      result.push( [key, self.get(key)] );
    });
    
    return result;
  },
  
  forEach : function(cb){
    var self = this;
   
    self._trueKeys.forEach(function(key){
      cb( self.get(key), key,  self);
    });
  }
  
}

















