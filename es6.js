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


























