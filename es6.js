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

ES6.templateString = function(ts){
  var reg = /\$\{([^${}]+)\}/g;
  var r = ts.match(reg);
  var result = ts;
  
  if( r == null ) return result;
  
  
}

















