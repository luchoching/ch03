# Asynchronous Programming的困難點

Closure + 就地定義的匿名函數寫起來快又精簡, 不用另外命名寫function, 不用跳來跳去看code

但也容易就可以寫得很亂, 喪失模組化, 重用性,  可維護性

[source](http://stackabuse.com/avoiding-callback-hell-in-node-js/):

``` js
const fs = require('fs');

const myFile = '/tmp/test';  
fs.readFile(myFile, 'utf8', function(err, txt) {  
    if (err) return console.log(err);

    txt = txt + '\nAppended something!';
    fs.writeFile(myFile, txt, function(err) {
        if(err) return console.log(err);
        console.log('Appended text!');
    });
});
```

callback只要疊兩層看了頭就會痛了

# 寫Asynchronous Programming的目標

  Recognizing that our code is becoming unwieldy, or even better, knowing in advance that it might become unwieldy and then acting accordingly with the most adequate solution is what differentiates a novice from an expert. 

認識到我們的代碼變得笨拙，甚至更好，事先知道它可能變得笨拙，然後採取最適當的解決方案是一個新手與專家的區別。

# Web Spider ver1

寫一個spider當例子: 接收一個Web URL作為輸入，並將其內容下載到一個文件中。