/**
  说明：
  1. 只针对高级浏览器
  2. 不会做很复杂的判断用户输入
*/

var ES6 = {}

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

//endsWith的行为与其他两个方法有所不同。
//它针对前n个字符，而其他两个方法针对从第n个位置直到字符串结束。
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

  function getObjKeys(obj){
    var keys = [];
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    
    for(var key in obj){
      if( hasOwnProperty.call(obj, key) ){
        keys.push(key);
      }
    }
    
    return keys;
  }

  result = ts.replace(reg, function(x, y){
    try{
      y = y.trim();
      var value = data[y];

      if( value == undefined ){
        var keys = getObjKeys(data);		
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





