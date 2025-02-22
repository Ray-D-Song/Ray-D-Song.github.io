---
title: '前端框架发展史'
date: '2024-8-28'
cover: 'https://r2.ray-d-song.com/2024/08/c61aa0540cda867fa007f88e7570c43a.jpeg'
tag: ['frontend', 'JavaScript', 'TypeScript']
remark: '2023-10-28 09:10 扬州'
---

## v0.1.0 DOM 操作时代
在这个时期, 由于不存在 Vite、Webpack 等 bundle 技术. 引入一个库的方式就是在index.html的`<head>`中引入一个`<script>`标签, 然后就可以使用该库暴露的全局变量.    
```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js">
```

这时前端开发者这个角色还没有被明确定义, 一般由后端开发者兼职.  
客户端和服务端交互的方式也很朴素, 通过 form 提交表单, 服务端返回的 html 片段直接插入到页面中.  

### jQuery
用[jQuery](https://jquery.com/)来操作 DOM 是早期网页开发的必备技能.  
作为 2006 年诞生的框架, 在 2024 年每周下载量依旧超过 722 万次.  

jQuery 本质是一个 DOM 操作库. 用`$`函数获取元素, 然后调用包装后的方法.  

下面是一个简单的登录表单提交的例子.  
可以看到, jQuery 通过`$().on()`方法封装了事件监听.  
通过`$().val()`方法获取表单的值.  
`$.ajax`方法封装了 XMLHttpRequest, 使得发送请求变得更加方便.  
```html
<main>
  <h2>jQuery</h2>
  <form id="loginForm">
    <label for="username">Username:</label>
    <input type="text" id="username" name="username">
    <label for="password">Password:</label>
    <input type="password" id="password" name="password">
    <button type="submit">Login</button>
  </form>
</main>
```
```js
$(document).ready(function() {
  // listen for form submission
  $('#loginForm').on('submit', function(event) {
    event.preventDefault()

    // get the values of the username and password fields
    var username = $('#username').val()
    var password = $('#password').val()

    if (username === '' || password === '') {
      alert('Please fill in both fields.')
      return
    }

    // send the login request
    $.ajax({
      url: 'http://localhost:3000/login/xml',
      method: 'POST',
      data: {
        username: username,
        password: password
      },
      success: function(response) {
        // replace the main content with the response
        $('main').html(response)
      },
      error: function(error) {
        console.error(error)
        alert('An error occurred. Please try again.')
      }
    })
  })
})
```
有不少人以为 jQuery 是 DOM 界的 [lodash](https://www.lodashjs.com/), 只是一个工具库而已.    
实际上 jQuery 支持[插件](https://plugins.jquery.com/), 有着活跃而庞大的社区.  
例如[jQuery UI](https://jqueryui.com/), 一个基于 jQuery 的 UI 库, 所以在当时, jQuery 的定位和现在的 React、Vue 有些类似.    

### 其他库
同一时期, 还有一些其他的库.    
* [Prototype](https://prototypejs.org/)
* [MooTools](https://mootools.net/)
* [RightJS](https://yuilibrary.com/)

其中 prototype.js 同样是旧时代的王者, 诞生于 Ruby on Rails 框架.  
因为早期的设计目标是为了让 JavaScript 表现的更像 Ruby(oop语言), 所以 API 设计上有面向对象的味道.  

除了和 jQuery 一样的 DOM 操作, prototype.js 还提供了一些其他的功能.  
例如原生的`Array`对象没有`数组打平`方法, prototype.js 提供了`Array.prototype.flatten`.  
```js
A = ['a', 'b',  ['c1','c2','c3'] , 'd',  ['e1','e2']  ]
B = A.flatten()

console.log(B.inspect())
// ['a','b','c1','c2','c3','d','e1','e2']
```

以及在没有`forEach`方法的时代, prototype.js 提供了`Array.prototype.each`方法.  
```js
['a', 'b', 'c'].each(function(item, index) {
  console.log(item, index)
})
```

最令 Javaer 和 Rubyist 感到亲切的应该是 prototype.js 在没有 class 关键字的年代提供了`Class`, 模拟了类和继承.  
```js
var Person = Class.create();
Person.prototype = {
  initialize: function(name) {
    this.name = name;
  },
  say: function(message) {
    return this.name + ': ' + message;
  }
};
    
var guy = new Person('Miro');
guy.say('hi');
// -> "Miro: hi"
    
var Pirate = Class.create();
// inherit from Person class:
Pirate.prototype = Object.extend(new Person(), {
  // redefine the speak method
  say: function(message) {
    return this.name + ': ' + message + ', yarr!';
  }
});
    
var john = new Pirate('Long John');
john.say('ahoy matey');
```

### 总结
jQuery 和 Prototype.js 的诞生, 除了简化烦人的 DOM 操作之外, 
更重要的是屏蔽浏览器之间的差异.  
没错, 早在 2007 年的时候, 就有大批的开发者为 IE 抓狂.  
<s>没想到, 17 年后的今天, 依旧有人在为 IE 抓狂.</s>

值得一提的是, 现代浏览器提供了`querySelector`和`querySelectorAll`方法, 使得 DOM 操作变得更加方便, 一定程度上也是因为 jQuery 这类库的成功.  

## v1.0.0 MVC/MVVM时代
随着客户端的开发工作量越来越大.  
最终的结局就是你的程序变成一堆 jQuery 调用和回调地狱, 再堆叠相互污染的全局变量和样式, 变得无法维护.  

一些开发者开始从服务端借鉴经验, 也就是类似 MVC(Model-View-Controller) 和 MVVM(Model-View-ViewModel) 这样的设计模式.  

所谓 MVC, 是指将应用程序分为三个部分: Model(数据), View(视图), Controller(控制器).  
而 MVVM 是在 MVC 的基础上, 将 Controller 替换为 ViewModel, 实现了数据和视图的双向绑定.  

更简单的说法是, 大家希望可以做到: 界面显示一个人的名字, 我就定义一个变量`name`, 界面显示的时候直接显示`name`, 修改`name`的时候界面也会自动更新.  

这个时代的代表作是 Backbone.js, Angular.js, Vue(1.x).  
Backbone.js.  
这三个库基本都是发布于 2010 年左右.  

### Angular.js
angular.js 因为有 Google 的背书, 很快就成为了主流.    
另一个重要原因是它非常先进, 拥有了一个现代单页应用框架应有的一切.  

#### 指令
Angular.js 的核心是指令, 通过指令可以扩展 HTML, 实现自定义的行为.
```html
<div ng-app="">
  <p>名字 : <input type="text" ng-model="name"></p>
  <h1>Hello {{name}}</h1>
</div>
```
上面这个例子, `ng-model`指令用于双向绑定 input 标签的值和 name 变量.  
而`{{name}}`则是一个模板, 会在 name 变量发生变化时自动更新.  

#### 模块化
Angular.js 通过模块化的方式组织代码, 使得代码更加清晰.  
```js
var app = angular.module('myApp', [])
app.controller('myCtrl', function($scope) {
  $scope.name = 'Ray'
})
```
上面这个例子, `angular.module`方法用于创建一个模块, `app.controller`方法用于创建一个控制器.  
这样, 你可以将代码分为多个模块和多个控制器, 避免全局变量污染.  

#### JSON 替代 XML
因为双向绑定的存在, Angular.js 更倾向于使用 JSON 作为数据传输格式.  
接收后端返回的 JSON 数据, 直接改变变量的值即可.  
```

```

#### 缺陷
Angular.js 有一个很大的缺陷, 就是引入了太多独有的`模式`.  
可以举一个简单的例子, `ng-if`指令的子元素无法直接访问 controller 中的内容.  
因为`ng-if`会创建一个新的作用域, 你需要通过`$parent`来访问父作用域.  
```html
<!-- ❌ -->
<div ng-if="show">
  <button ng-click="handleSubmit()">submit</button>
</div>

<!-- ✅ -->
<div ng-if="show">
  <button ng-click="$parent.handleSubmit()">submit</button>
</div>
```

最终你会发现, 你的代码中充斥着`$scope`、`$rootScope`、`$parent`这样的东西. 而实现一个简单的需求, 所需要的代码量比 jQuery 要多得多.  

下面是一个简单的登录表单提交的例子.  
```html
<main ng-controller="loginController">
  <h2>Angular.js</h2>
  <form ng-if="formVisible">
    <label for="username">Username:</label>
    <input type="text" ng-model="$parent.username" name="username">
    <label for="password">Password:</label>
    <input type="password" ng-model="$parent.password" name="password">
    <button type="button" ng-click="submit()">Login</button>
  </form>
  <h2 ng-if="messageVisible">{{ welcomeMessage }}</h2>
</main>
```
```js
angular.module('loginApp', [])
  .controller('loginController', function($scope, $http) {
    $scope.username = ''
    $scope.password = ''
    $scope.formVisible = true
    $scope.messageVisible = false
    $scope.welcomeMessage = ''
    $scope.submit = function() {
      console.log($scope)
      if ($scope.username === '' || $scope.password === '') {
        alert('Please fill in both fields.')
        return
      }

      $http({
        url: 'http://127.0.0.1:3000/login/json', 
        method: 'POST',
        data: {
          username: $scope.username,
          password: $scope.password
        },
      }).then(function(response) {
        $scope.formVisible = false
        $scope.messageVisible = true
        $scope.welcomeMessage = response.data.message
      }, function(error) {
        alert('Login failed: ' + error.data.message)
      })
    }
  })
```

总结下来, Angular.js 优势在于其先进的设计理念和规整度, 这对大型项目非常友好.  
劣势也很明显, 太多的繁文缛节, 使得中小型项目变得复杂.  
其中有一些设计是因为当时没有打包器, 也就没有编译时可以对代码进行处理, 上面提到的 ng-if 造成的作用域问题就是其中之一.  

### Vue.js
Vue1.x 实际上是 Angular.js 的一个简化和优化版.

### Backbone.js

## v2.0.0 组件化时代
Knockout.js, React.js, Vue(2.x)
## v2.5.0 hooks 时代
这个时期的代表是 React(16.8), Vue(3.x).  
Hooks 之所以被称为 "hooks"（钩子）, 是因为它们允许你在函数组件中「钩入React」的状态和生命周期特性, 而无需编写类组件.


## v3.0.0 SSR/大编译时代
这个时期的代表是 Next.js/Nuxt.js(SSR), Vite/Rspack/Turbo(打包器).
为什么我不说微前端时代, <s>因为在我眼里这是不入流的技术</s>. 相对来说`islands`这种技术含金量更高, 也更有前途.  
不管是微前端还是`islands`, 都是为了解决大型项目复杂性的一个方案, 并没有从根上改变什么.  

### SSR
SSR(Server Side Render) 是指在服务端渲染页面, 然后将渲染好的页面返回给客户端.  
有些人会觉得, 在 0.1.0 时代不就是这样吗? 后端直接返回 html 片段, 同样不用在客户端跑 js 生成界面.  

这里有一个很大的区别, 0.1.0 时代你必须编写原生的 html, 服务端只是将这些 html 返回给客户端.  
因此不能使用 .vue 这样的DSL(领域特定语言), jsx 尙可以用`runtime babel`, 但体验也不好.    

SSR 通过在服务端用 node.js 这样的运行时执行 JavaScript 代码, 渲染 html 再进行返回, 因此可以处理.vue、jsx这样的文件.    

#### 为什么要 SSR
客户端渲染有个很大的问题, 就是首屏加载慢.  
在 lazy load 这种技术出现之前, 你的页面可能要等到所有 js 加载完并执行一次才能显示, 在这之前用户只能看到一个空白页面.  
使用 SSR, 用户可以直接看到页面内容, 同时客户端 JavaScript 会在后台加载, 之后再接管页面(水合).

有很多人认为 SSR 是为了 SEO 而生, 但实际上 Google 早就可以处理客户端渲染的页面了, 过去这种说法缺乏确切的论据, 好在 Vercel 最近做了[详尽的测试](https://vercel.com/blog/how-google-handles-javascript-throughout-the-indexing-process).  

既然提到了 Vercel, SSR 爆火的起点其实正是`Vercel、Netlify、cloudflare`三位赛博菩萨.    
客户端渲染的优势是你可以直接将静态资源托管到 CDN, 成本极低, 而 SSR 要求你至少需要一个服务器.  
上面三位提供了免费的服务器资源、自动部署、自动域名配置, 极大地降低了这一技术的成本.   

同时 Vercel 的 Next.js 框架完善了 SSR 的生态, 使得 SSR 变得更加容易.  

### 编译时代
我们可以看到在 2.0 时代大家更多的是关注 runtime(运行时) 而不是 compiletime(编译时).  
例如 React fiber, 自己实现了一套调度算法, 优化 React 的「表现性能」, 就是典型的 runtime 优化.  

伴随着`Vite、Rspack、Turbo`这些打包工具越来越强大, 人们开始更多的关注编译期可以进行的操作.  

这里的编译主要指两方面:
* Virtual DOM
* 打包器插件

#### 不再使用 Virtual DOM
n 年前, vdom 是一个很火的概念, 大家普遍认为虚拟DOM可以提高性能, 以及解决跨平台问题.  
转折点是 Solid 和 Svelte 两个新秀框架, 在编译期直接生成 DOM 和相应的 js 操作代码, 不再有 vdom 和 diff 的过程.  

> 这一切都基于 signals 这种细粒度的状态管理基础  

从 benchmark 来看, Solid 和 Svelte 的性能要远远高于仅在运行时优化性能的 React.  

React team 也在 2021 年介绍了一个自动生成 memo 等优化代码的编译器. 项目的正式命名是 React forget, 鸽了三年也没动静.  

Vue team 在最新的 conf 上提出了 Vue vapor 模式, 参考了 Svelte 的思路, 但是目前还在实验阶段.  
Vue 的`type-only define API`也是编译期探索的产物. 通过类型定义来生成运行时需要的声明代码, 简化声明过程.  
```ts
defineProps<{
  foo: string
  bar: number
}>()

// compile to
props: {
  foo: {
    type: String,
    required: true
  },
  bar: {
    type: Number,
    required: true
  }
}
```
如果你感兴趣的话, 可以阅读我这篇文章: [Vue 宏编译: 以 defineProps 为例](https://ray-d-song.com/blog/vue-compiler-macro-defineprops/)

#### 打包器插件
WebPack 时代就有丰富的插件生态, 但TypeScript 还没有现在这么流行, 可以给编译器用的的元数据很少, 因此各种基于 AST 的插件很难实现.  
现在 TypeScript 已经成为前端的事实标准, 催生了[unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import), [generouted](https://github.com/oedotme/generouted) 等众多类型安全的代码生成插件.  

## 结语
受限于篇幅, Typescript、Signals和Immutability之争、WebAssembly、Web Components 等技术没有在本文中提及.  
尤其是 TypeScript, 值得单独写一篇文章.  
如果内容有误, 欢迎指正.  