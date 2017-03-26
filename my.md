## 寫Asynchronous Programming的目標

  Recognizing that our code is becoming unwieldy, or even better, knowing in advance that it might become unwieldy and then acting accordingly with the most adequate solution is what differentiates a novice from an expert. 

認識到我們的代碼變得笨拙，甚至更好，事先知道它可能變得笨拙，然後採取最適當的解決方案是一個新手與專家的區別。

# Web Spider Ver1

寫一個spider當例子: 接收一個Web URL作為輸入，並將其內容下載到一個文件中。

```
cd code && git checkout spider-init
```

# 觀察Asynchronous Programming的困難點

Closure + 就地定義的匿名函數寫起來快又精簡, 不用另外命名寫function, 不用跳來跳去看code

但也容易就可以寫得很亂, 喪失模組化, 重用性,  可維護性

callback只要疊兩層看了頭就會痛了

## The Callback hell 

spider() function:  即使邏輯直覺簡單, 還是有好幾層的縮排, 難讀

使用直接樣式阻塞API(a direct style blocking AP) 實現類似的功能將是直接的，並且很少有機會使它看起來這麼錯誤。

寫asynchronous CPS很容易會這樣, 不當使用closure可能導致令人難以置信的錯誤程式碼。(me: 很常, 很容易)

    The situation where the abundance of closures and in-place callback definitions transform the code into an unreadable and unmanageable blob is known as callback hell. 

其中大量的閉包和就地回調定義將代碼轉換為不可讀和不可管理的blob的情況被稱為回調地獄( **callback hell** )。


它是Node.js和JavaScript中最常被公認和嚴重的反模式(anti-patterns)之一:

``` js
asyncFoo( err => {
    asyncBar( err => {
       asyncFooBar( err => {
         //...
        }); 
    });
});
```

**pyramid of doom** (末日金字塔):

程式可讀性差, 除非借助工具, 不然追蹤function頭尾很難

    Another issue is caused by the overlapping of the variable names used in each scope. Often, we have to use similar or even identical names to describe the content of a variable. The best example is the error argument received by each callback. 

另一個問題是由每個作用域中使用的變量名的重疊引起的。 通常，我們必須使用相似或甚至相同的名稱來描述變量的內容。 最好的例子是每個回調接收的錯誤參數。

有些人經常嘗試使用相同名稱的變體來區分每個作用域中的對象，例如err，error，err1，err2等; 其他人更喜歡通過使用相同的名稱來隱藏範圍中定義的變量; 例如，err。 這兩種替代方案都不完美，並且造成混亂並增加引入缺陷的概率。

    Also, we have to keep in mind that closures come at a small price in terms of performance and memory consumption. 

此外，我們必須記住，關閉性能和內存消耗在一個小的價格。


    In addition, they can create memory leaks that are not so easy to identify because we shouldn't forget that any context referenced by an active closure is retained from garbage collection. 

此外，他們可以創建不容易識別的內存洩漏，因為我們不應該忘記活動閉包引用的任何上下文是從垃圾回收保留的。
