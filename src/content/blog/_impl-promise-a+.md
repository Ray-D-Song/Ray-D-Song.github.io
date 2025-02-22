---
title: '手撕 Promise'
date: '2024-08-19'
cover: ''
tag: ['JavaScript']
---

上一份工作的面试官曾让我白纸手撕 Promise, 作为从不背题的人当然没写出来. 昨天突然想起来这茬, 决定试一试.  

JavaScript 的 Promise 符合[Promise/A+](https://Promisesaplus.com/)规范, 该规范其实是第二版了, 第一版叫[Promise/a](https://wiki.commonjs.org/wiki/Promises/A), a+ 主要是明确了 a 中一些模糊的部分.  

以下都用`规范`来代指 Promise/A+.

规范只规定了`.then`, 没有`finally、catch`的部分. 同时, 规范有完善的[测试集](https://github.com/Promises-aplus/Promises-tests), 八百多个 case. 测试集全数通过就代表你实现了标准的 Promise.  

## Promise 的大体内容

### 三种状态
Promise 有三种状态:  
* pending(等待): 操作完成前
* fulfilled(履行): Promise 被 resolve, 表示操作完成, 到这里状态就不可变了, 同时必须返回一个不可变的 value
* rejected(拒绝): Promise 被 reject, 表示操作失败, 同样是最终状态, 不可变

此处的不可变, 指的是引用不变. 也就是说, `let obj = { a: 1 }; obj.a = 2`, 依旧算作没有变.

### then 方法*
then 方法是 Promise 的核心, 接受两个参数
```javascript
Promise.then(
  /**
   * Promise 被 resolve 时的回调
   * 必须是函数, 不是函数就忽略
   * @param value 代表 Promise 的最终值
   */
  onFulfilled,
  /**
   * Promise 被 reject 时的回调
   * 必须是函数, 不是函数就忽略
   * @param reason 代表 Promise 被 reject 的 reason
   */
  onRejected
)
```
同时, then 方法还必须符合以下规定:
* then 方法必须返回一个 Promise
* Promise 可以调用多次 then (基于上一条规定), 同时所有的 onFulfilled 和 onRejected 会按注册顺序返回

## 实现 Promise
要实现 Promise 本质是要模拟 microtask, 什么是 microtask 这里不再赘述.  
网上流行的一种做法是使用 setTimeout, 但其实更推荐用`process.nextTick(node 环境)`和`queueMicrotask`, 这里采用 queueMicrotask.  
  
