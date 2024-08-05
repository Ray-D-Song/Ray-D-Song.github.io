---
title: 'Vue 宏编译: 以 defineProps 为例'
date: '2024-02-29'
cover: ''
tag: ['Vue']
---

Vue macro(宏) 随着`<script setup>`写法一同引入 Vue 生态, 进一步丰富了 Vue 在编译期的想象力.  
本文主要分析 Vue defineProps 的 type-only 写法是如何根据类型信息生成运行时代码.  

我们先拉取 Vue 的源代码, 并切换到3.0.3版本, 这是最早引入 script setup 和 defineProps macro 的版本.  

Vue 的 script setup 编译器源码位于`packages/compiler-sfc/src/compileScript.ts`, 接下来所有的代码都出自这个文件

为了方便查看运行结果和打印, 在根目录下的`package.json`新增`test-compiler`命令, 这条命令表示只运行`packages/compiler-sfc`文件夹下的`with TypeScript`测试.
```json
"scripts": {
  "test-compiler": "jest packages/compiler-sfc --testPathPattern='packages/compiler-sfc' --testNamePattern='with TypeScript' ",
  },
```
先看 defineProps<{}>() 会被编译成什么  
在`packages/compiler-sfc/__tests__/compileScript.spec.ts`文件的451 行打个`console.log(content)`, 查看编译完成的内容  
输入:  

```vue
<script setup lang="ts">
import { defineProps } from 'vue'


defineProps<{
  string: string
  number: number
  boolean: boolean
  object: object
  // ...
}>()
</script>
```

输出:
```typescript
import { defineComponent as _defineComponent } from 'vue'


export default _defineComponent({
  expose: [],
  props: {
    string: { type: String, required: true },
    number: { type: Number, required: true },
    boolean: { type: Boolean, required: true },
    object: { type: Object, required: true },
    // ...
  } as unknown as undefined,
  setup(__props: {
        string: string
        number: number
        boolean: boolean
        object: object
        // ...
      }) {

return {  }
}

})
```
可以看到 defineProps 被编译为`defineComponent`方法中的 options props 写法, 同时还定义了 defineComponent 方法中的 setup 函数选项并保留了类型的定义.  

## 定位
在`packages/compiler-sfc/src/compileScript.ts`文件中, 我们一眼能找到一个看起来是处理 props 的方法:
```typescript
function processDefineProps(node: Node): boolean {
  if (isCallOf(node, DEFINE_PROPS)) {
    hasDefinePropsCall = true
    // context call has type parameters - infer runtime types from it
    if (node.typeParameters) {
      const typeArg = node.typeParameters.params[0]
      if (typeArg.type === 'TSTypeLiteral') {
        propsTypeDecl = typeArg
      }
    }
    return true
  }
  return false
}
```
这个函数接受参数`node`, 并将propsTypeDecl赋值为 node.typeParameters.params[0]  
接下来我们按照看源码的惯例: 向前找入参 node, 向后找 propsTypeDecl 的作用.

## 向前看: node 是什么, 从哪来
我们在 processDefineProps 方法中打印一下 node:
```typescript
Node {
  type: 'CallExpression',
  start: 101,
  end: 732,
  loc: SourceLocation {
    start: Position { line: 7, column: 6 },
    end: Position { line: 30, column: 10 },
    filename: undefined,
    identifierName: undefined
  },
  range: undefined,
  leadingComments: undefined,
  trailingComments: undefined,
  innerComments: undefined,
  extra: undefined,
  callee: Node {
    type: 'Identifier',
    start: 101,
    end: 112,
    loc: SourceLocation {
      start: [Position],
      end: [Position],
      filename: undefined,
      identifierName: 'defineProps'
    },
    range: undefined,
    leadingComments: undefined,
    trailingComments: undefined,
    innerComments: undefined,
    extra: undefined,
    name: 'defineProps'
  },
  arguments: [],
  typeParameters: Node {
    type: 'TSTypeParameterInstantiation',
    start: 112,
    end: 730,
    loc: SourceLocation {
      start: [Position],
      end: [Position],
      filename: undefined,
      identifierName: undefined
    },
    range: undefined,
    leadingComments: undefined,
    trailingComments: undefined,
    innerComments: undefined,
    extra: undefined,
    params: [ [Node] ]
  }
}
```
熟悉 babel 的哥们应该一眼能看出这是 babel 的 AST(抽象语法树).  
> 抽象语法树可以简单理解为分析源代码产生的相关信息  

我们继续找, 看看是哪里提供了这个 node.  
在 552 行, 我们可以找到 node 是 scriptSetupAst 的遍历子节点  
```typescript
// line 552
for (const node of scriptSetupAst)
```
而 `scriptSetupAst` 是调用了 parse 函数, 传入了`<script setup>`标签内的内容  
```typescript
// parse <script setup> and  walk over top level statements
const scriptSetupAst = parse(
  scriptSetup.content,
  {
    plugins: [
      ...plugins,
    ],
    sourceType: 'module'
  },
  startOffset
)
```
继续寻找 parse 函数的定义, 在 209 行.  
parse 函数调用了_parse 函数, 而 _parse 函数是`@babel/parser`包中 parse 函数的别名, 该函数返回的就是 Babel AST 格式的 AST, 证实了之前的猜想    
```typescript
function parse(
  input: string,
  options: ParserOptions,
  offset: number
): Statement[] {
  try {
    return _parse(input, options).program.body
  } catch (e) {
    ...
  }
}
```
到这里, 「向前看」的工作已经完成, 大体流程为
![half](https://r2.ray-d-song.com/2024/02/2101e0b9f3936ba65773c8f9a77e3db2.png)

## 向后看: propsTypeDecl 有什么用, 怎么处理
processDefineProps 的作用是对 propsTypeDecl 赋值, 那么赋值后对 propsTypeDecl 进行了哪些操作就是生成运行时 props 定义的关键.   
按照惯例, 首先打印 propsTypeDecl
```typescript
propsTypeDecl:  Node {
  type: 'TSTypeLiteral',
  start: 113,
  end: 729,
  loc: SourceLocation {
    start: Position { line: 7, column: 18 },
    end: Position { line: 30, column: 7 },
    filename: undefined,
    identifierName: undefined
  },
  range: undefined,
  leadingComments: undefined,
  trailingComments: undefined,
  innerComments: undefined,
  extra: undefined,
  members: [
    Node {
      type: 'TSPropertySignature',
      start: 123,
      end: 137,
      loc: [SourceLocation],
      range: undefined,
      leadingComments: undefined,
      trailingComments: undefined,
      innerComments: undefined,
      extra: undefined,
      key: [Node],
      computed: false,
      typeAnnotation: [Node]
    },
    Node {
      type: 'TSPropertySignature',
      start: 146,
      end: 160,
      loc: [SourceLocation],
      range: undefined,
      leadingComments: undefined,
      trailingComments: undefined,
      innerComments: undefined,
      extra: undefined,
      key: [Node],
      computed: false,
      typeAnnotation: [Node]
    },
    Node {
      type: 'TSPropertySignature',
      start: 169,
      end: 185,
      loc: [SourceLocation],
      range: undefined,
      leadingComments: undefined,
      trailingComments: undefined,
      innerComments: undefined,
      extra: undefined,
      key: [Node],
      computed: false,
      typeAnnotation: [Node]
    },
    ...
  ]
}
```
可以看到, propsTypeDecl 就是 defineProps 类型声明的 AST. 主要内容是`members`字段, 每一个Node对应着一个 props 元素声明  

接下来我们找哪里使用了这个`propsTypeDecl`  

propsTypeDecl 有两处引用
### 生成运行时props(重点)
```typescript
// 4. extract runtime props/emits code from setup context type
if (propsTypeDecl) {
  extractRuntimeProps(propsTypeDecl, typeDeclaredProps, declaredTypes)
}
```
参数除了 propsTypeDecl 之外, 还有  
* typeDeclaredProps: 类型定义为`Record<string, string[]>`, 默认为{}的变量  
* declaredTypes: 类型`Record<string, string[]>`, 默认{}的变量  

接下来看看这个函数都做了啥操作  
```typescript
function extractRuntimeProps(
  node: TSTypeLiteral,
  props: Record<string, PropTypeData>,
  declaredTypes: Record<string, string[]>
) {
  // members 即 literal type 的AST数组
  for (const m of node.members) {
    // 判断是否为 literal type
    if (m.type === 'TSPropertySignature' && m.key.type === 'Identifier') {
      // 为 typeDeclaredProps 添加字段
      props[m.key.name] = {
        key: m.key.name,
        required: !m.optional,
        type:
          // dev 下生成 type 字段, 生产环境不需要类型信息, 直接赋值 null
          __DEV__ && m.typeAnnotation
            ? inferRuntimeType(m.typeAnnotation.typeAnnotation, declaredTypes)
            : [`null`]
      }
    }
  }
}
```
该函数的作用就是根据 AST 的信息生成运行时的 props 声明, 并赋值给第二个参数`typeDeclaredProps`, 这个参数最终就是编译完成的 Props.  
这里还调用了`inferRuntimeType`方法, 方法主体就是 switch 语句, 根据不同的`node.type`字段返回不同的运行时类型声明  
截取其中一小段:  
```typescript
switch (node.type) {
  case 'TSStringKeyword':
    return ['String']
  case 'TSNumberKeyword':
    return ['Number']
```

### 生成 __props 字段
propsTypeDecl 另一处引用是用来生成`defineProps`方法中的__props字段:  
```typescript
// 9. finalize setup() argument signature
let args = `__props`
if (propsTypeDecl) {
  args += `: ${scriptSetup.content.slice(
    propsTypeDecl.start!,
    propsTypeDecl.end!
  )}`
}
// inject user assignment of props
// we use a default __props so that template expressions referencing props
// can use it directly
if (propsIdentifier) {
  s.prependRight(startOffset, `\nconst ${propsIdentifier} = __props`)
}
if (emitIdentifier) {
  args +=
    emitIdentifier === `emit` ? `, { emit }` : `, { emit: ${emitIdentifier} }`
  if (emitTypeDecl) {
    args += `: {
      emit: (${scriptSetup.content.slice(
        emitTypeDecl.start!,
        emitTypeDecl.end!
      )}),
      slots: any,
      attrs: any
    }`
  }
}
```

## 总结
到这里我们分析完了整个的流程, 如下:
![full flow](https://r2.ray-d-song.com/2024/02/4feb8aaf8c3cda71a6383100a72cb3e2.png)