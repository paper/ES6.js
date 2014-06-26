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

var _TYPE = ["String", "Number", "Function", "Boolean", "Object", "Array"];
_TYPE.forEach(function(v){
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

  return index == atIndex;
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
        var keysStr = '';
        
        keys.forEach(function(v){
          keysStr += "("+ v +")";
        });
        keysStr = "[" + keysStr + "]";

        var c = y.replace(new RegExp(keysStr, "g"), function(a){
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
  3. proto属性，Object.setPrototypeOf()，Object.getPrototypeOf()
  4. 增强的对象写法
  5. 属性名表达式
  6. Symbol
  7. Proxy
  8. Object.observe()，Object.unobserve()
  --------------------------------------------------------------------------
*/

Object.is = function(a, b){
  // 有一个 +0 , 有一个 -0
  if( (a === 0 && b === 0) && 1/a !== 1/b ){
    return false;
  }
  
  //a=NaN, b=NaN
  if( ES6.isNumber(a) && ES6.isNumber(b) && isNaN(a) && isNaN(b) ){
    return true;
  }
  
  return a === b;
}







