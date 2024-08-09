---
title: 'Astro 如何正确设置博客的 i18n'
date: '2024-08-09'
cover: ''
tag: ['Other']
---
理想的博客国际化应该满足以下几点:  
1. 不同语言都可以被静态预构建, 而不必等待 ssr 渲染
2. 首次访问时可以自动跳转到正确的语言
3. 用户切换语言后, 保存用户的选择

Astro博客项目的结构应该形同如下:
```bash
- src
  /content
    /en
    /zh-CN
  /pages
    /[lang]/blog/[...slug].astro
    index.astro
```
en 和 zh-CN 作为同级目录, 分别代表中英两种语言的内容.  
pages 目录代表真实渲染的页面, [lang]和[...slug]则是动态渲染插槽, 访问`/zh-cn/blog/how-to-be-hero`这个路径时, `lang=zh-cn, slug=how-to-be-hero`就会作为参数被传递到组件中.  

## 首次访问
为了处理首次访问的逻辑, 我们需要`navigator.language api`, 通过它可以获取用户的语言偏好设置.  

一般博客首页都是文章列表, 在不依赖 ssr 的情况下, 想要展示正确语言的列表, 就只有`全量渲染、在客户端用 js 隐藏`.  

```js
// 用户切换语言后的缓存, 没有就读取 navigator api
const langCache = window.localStorage.getItem('language')
const userLang = langCache || navigator.language

// 遍历, 并判断 slug 和语言偏好是否一致, 不一致则隐藏
uls.forEach((ul) => {
  if(userLang === 'zh-CN') {
    if(!ul.dataset.slug?.includes('zh-cn')) {
      ul.style.display = 'none'
    }
  } else {
    if(ul.dataset.slug?.includes('zh-cn')) {
      ul.style.display = 'none'
    }
  }
})
```

## 保存用户选择并重载页面
如果用户想要自己切换语言, 可以将整个过程分为两步逻辑:  
```js
function handleLanguage() {
  // 获取语言缓存选项
  const languageCache = window.localStorage.getItem('language')
  const href = window.location.href
  const blogPath = pathname.split('/').slice(2).join('/')
  /**
   * 判断当前地址和语言是否对应
   * 不对应则跳转到正确的地址
   */ 
  if(languageCache === 'zh-CN' && !href.includes('zh-cn')) {
    window.location.href = `/zh-cn/${blogPath}`
  }
  if(languageCache === 'en' && !href.includes('en')) {
    window.location.href = `/en/${blogPath}`
  }
}
const pathname = window.location.pathname
if(pathname !== '/' && pathname !== '') {
  handleLanguage()
}
```

```js
// 点击按钮修改缓存中的值  
btn.addEventListener('click', () => {
  const lang = btn.dataset.lang as string
  window.localStorage.setItem('language', lang)
  // 重载页面
  window.location.reload()
})
```