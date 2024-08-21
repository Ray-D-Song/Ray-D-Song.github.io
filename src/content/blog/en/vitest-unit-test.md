---
title: 'Unit Testing Vue with Vitest'
date: '2023-12-18'
cover: ''
tag: ['Test']
---

# Definition of Unit Testing
> Source code for this article: https://github.com/Ray-D-Song/vitest-tutorial-sourcecode

> Unit testing, also known as module testing, is the testing work aimed at verifying the correctness of program modules (the smallest unit of software design). A program unit is the smallest testable part of an application. In procedural programming, a unit can be a single program, function, procedure, etc.; for object-oriented programming, the smallest unit is a method, including methods in base classes (superclasses), abstract classes, or methods in derived classes (subclasses). ——wiki

In a typical Vue project, the modules that often require unit testing include the following:
* hooks
* utility functions (utils)
* validation rules (reg)
* scaffolding (bin/scaffold)
* custom Vue directives
* global state (store)

# Initializing Vitest
Install Vitest
```bash
pnpm add -D vitest
```
Vitest integrates by default with Vite configuration, no additional configuration files are needed.  
Modify `package.json`, add a `test:unit` command under `scripts`
```json
  "scripts": {
    ...
    "test:unit": "vitest",
  },
```

# Writing Test Cases
Testing a phone number validation function
```ts
/** /reg/phone.ts */
// Check if it is a Chinese mobile phone number
export function regChinesePhoneNumber(phoneNumber: string) {
  const regex = /^1[3456789]\d{9}$/
  return regex.test(phoneNumber)
}

/** /reg/phone.test.ts */
import { describe, expect, test } from 'vitest'
import { regChinesePhoneNumber } from '../phone'

describe('phone', () => {
  test('phone number belongs to Chinese', () => {
    expect(regChinesePhoneNumber('17725663831')).toBe(true)
  })
})
```
Run the command `npm run test:unit`, and you should see the following output, indicating the test passed:
![test result](https://r2.ray-d-song.com/202312071947299.png)

Test code files are typically placed in the `__test__` folder, named `xxx.test.ts` or `xxx.spec.ts`, Vitest will automatically run all files with such naming conventions.  
The foundation of writing tests includes the keywords `describe`, `test`, and `expect`.  
`describe` is used to define a test `suite`, similar to modules in JavaScript, used to encapsulate multiple tests together, and can achieve functionalities like selective testing using APIs like `skip`, `only`, etc.  
`test` is used to declare a test, accepting a test name and a function that holds the expected test results.  
`expect` is used to set assertions. Vitest provides assertions based on `chai` by default. If you are not familiar with chai, don't worry, assertions are crucial helpers in unit testing, and will be detailed later.

# Practice
Next, we will perform unit tests on several common scenarios.
## hooks
Hooks encapsulate logic and are scenarios that require testing the most.  
A common requirement for editors and forms is to record the last modification time. We can encapsulate a hooks with a few lines of code.
```ts
/** /src/hooks/useLastChange.ts */
import { watch, ref, type WatchSource } from 'vue'
import moment from 'moment/moment'

export function useLastChange(source: WatchSource) {
  const lastChange = ref('')

  watch(source, () => {
    lastChange.value = moment().format('YYYY-MM-DD HH:mm:ss')
  })

  return lastChange
}

/** /src/hooks/__test__/useLastChange.test.ts */
import { expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { useLastChange } from '../useLastChange'

it('update lastChange when source changes', async () => {
  const source = ref('')
  const lastChange = useLastChange(source)
  const snapShot01 = lastChange.value
  source.value = 'Ray'
  await nextTick()
  const snapShot02 = lastChange.value

  expect(snapShot01).not.toBe(snapShot02)
})
```
Testing hooks is relatively simple, it involves executing and comparing results. Testing utils and reg follows a similar pattern, and will be skipped here.

## scaffold
Scaffolding is generally a command-line tool provided by the framework itself, used to generate template code and placed in the bin directory.  
Vue and React themselves only provide project creation tools, without a project setup tool similar to Rails Command Line. Therefore, scaffolding for frontend spa projects is usually custom-made for common business scenarios.  
Scaffolding is usually executed via npm commands, add a command in package.json
```json
"create": "node ./bin/create.js --type=$npm_config_type --path=$npm_config_path
```
Run `npm run create --type=table --path='/Users/ray-d-song/temp/SourceCode/vitest-tutorial-sourcecode/src/views/TestTable.vue'`, this will execute the content in /bin/index script and pass type and path values as parameters.  
Write the create script:
```js
/** /src/bin/create.js */
import minimist from 'minimist'
import { readFileSync, writeFileSync } from 'fs'

function main() {
  // Using minimist to handle parameters
  const args = minimist(process.argv.slice(2))
  const { type, path } = args
  let temp = ''
  if(type === 'table') {
    temp = readFileSync('./src/bin/dist/table', 'utf-8') 
  }
  writeFileSync(path, temp)
  console.log('\nsuccess')
}

main()
```
Scaffolding actually performs 3 operations: obtaining parameters, reading the corresponding template, and creating the target file.  
Vitest and jest do not have a good way to execute npm commands, so we need to slightly modify the above method:
```js
/** /src/bin/create.js */
import { readFileSync, writeFileSync } from 'fs'

function create(args) {
  const { type, path } = args
  let temp = ''
  if(type === 'table') {
    temp = readFileSync('./src/bin/dist/table', 'utf-8') 
  } else {
    throw 'only support table'
  }
  writeFileSync(path, temp)
  console.log('\nsuccess')
}

export default create

/** /src/bin/index.js */
import create from './create'

// use minimist process args
const args = minimist(process.argv.slice(2))
try {
  create(args)
} catch(e) {
  console.log(e)
}
```
Separating the script entry and execution method is to prevent errors from automatically executing the main method during unit testing.  
Now we can import the create method in the test for testing. Assertions can be made by comparing the generated template content with the content in the table file.  
Below are the test cases, testing from parameters to generated content
```ts
/** /src/bin/__test__/create.test.ts */
import create from '../create'
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'

describe('bin scaffold module', () => {

  describe('create table error args', () => {
    it('error temp type', () => {
      try {
        create({
          type: 'dialog',
          path: '/Users/ray-d-song/temp/SourceCode/vitest-tutorial-sourcecode/src/bin/__test__/dialog.vue'
        })
      } catch(e) {
        expect(e).toBe('only support table')
        const product = readFileSync('/Users/ray-d-song/temp/SourceCode/vitest-tutorial-sourcecode/src/bin/__test__/dialog.vue', 'utf-8')
        expect(product).toBeUndefined
      }
    })
  })

  it('create table', () => {
    create({
      type: 'table',
      path: '/Users/ray-d-song/temp/SourceCode/vitest-tutorial-sourcecode/src/bin/__test__/table.vue'
    })
    const temp = readFileSync('/Users/ray-d-song/temp/SourceCode/vitest-tutorial-sourcecode/src/bin/dist/table', 'utf-8')
    const product = readFileSync('/Users/ray-d-song/temp/SourceCode/vitest-tutorial-sourcecode/src/bin/__test__/table.vue', 'utf-8')
    expect(temp).toBe(product)
  })

})
```
![result](https://r2.ray-d-song.com/202312121120257.png)

## Custom Vue Directives
Customize a `v-debounce` directive to add debounce effect to a button.
```ts
import _ from 'lodash'

const vDebounce = {
  beforeMount(el: HTMLElement, binding: {value: () => void}) {
    el.addEventListener('click', _.debounce(binding.value, 600))
  }
}

app.directive('debounce', vDebounce)
```
To test this directive, we need to simulate the process of `component mounting -> user clicking -> method calling`, which requires the ability to call parts of the component for testing. `@vue/test-utils` is a commonly used Vue component testing library.
```bash
pnpm install @vue/test-utils
```
vue-test-utils is compatible with jest and Vitest, and can be used directly after installation. Below is a functional test for the custom directive:
```ts
/** /src/utils/__test__/directives.test.ts */
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { vDebounce } from '../directives'

// Define the test component using defineComponent
// In addition to passing the template as a string
// You can also use tsx to get better code hints
const tc = defineComponent({
  setup() {
    const num = ref(0)
    function add() {
      num.value++
    }
    return {
      num,
      add  
    }
  },
  template: '<button v-debounce="add">num: {{num}}</button>'
})

describe('custom directives', async () => {
  // The mount api of vue-test-utils instantiates the component
  it('debounce submit', async () => {
    const wrapper = mount(tc, {
      global: {
        directives: {
          debounce: vDebounce
        }
      }
    })

    // click button every 200ms
    const interval = setInterval(async () => {
      // use find api search target
      await wrapper.find('button').trigger('click')
    }, 200)
    /**
     * Block for 1000 seconds
     * let the click event execute 4 times 
     * within 1 second
     */ 
    await new Promise(resolve => setTimeout(resolve, 1000))

    clearInterval(interval)

    /**
     * Block for 700 seconds, 
     * waiting for the function to execute
     */
    await new Promise(resolve => setTimeout(resolve, 700))
    // ensure component rerender
    await nextTick()
    // get target element
    const btn = wrapper.get('button')
    // Assert the text of the target element
    expect(btn.text()).toBe('num: 1')
  })
})
```
## Store
Large frontend projects usually require a global state management library, and Pinia is the most popular for Vue 3.
Pinia provides APIs that can be used for testing.
```ts
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useCounterStore } from '../counter'

describe('Counter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('increments', () => {
    const counter = useCounterStore()
    expect(counter.count).toBe(0)
    counter.increment()
    expect(counter.count).toBe(1)
  })
})
```
Here we introduce a new API: `beforeEach`, which is a `test lifecycle hook` that executes the provided method before each test case. We pass in the `setActivePinia` API from Pinia, which is commonly used in SSR to set an active Pinia instance.

# Assertions
Assertions are the core of unit testing, essentially a library of functions used to determine results.
In the example above, we used the `toBe` assertion, which is the most commonly used assertion. This assertion is used to check for value equality or reference equality, similar to `Object.is`.
Below are some commonly used assertions:
| Assertion | Function |
| ---- | ---- |
| not | Negates the assertion |
| toBe | Checks for value or object reference equality |
| toEqual | Checks for object value equality |
| toBeGreaterThan | Checks if value is greater than |
| toBeGreaterThanOrEqual | Checks if value is greater than or equal to |
| toBeLessThan | Checks if value is less than |
| toBeLessThanOrEqual | Checks if value is less than or equal to |
| soft | `expect.soft` continues testing even if a test case fails, displaying all errors after all tests are executed |
| toBeTypeOf | Checks if types are the same |
| toBeInstanceOf | Checks if it is an instance of the target class |
| toStrictEqual | Strict equality check, includes checking for undefined properties, array sparsity, and object type equality |
| toContain | Checks for array elements or substrings |
| toThrowError | Checks if an error is thrown during function call |
| resolves | `expect(func()).resolves.toEqual` |
| rejects | `expect(func()).rejects.toThrow` |

# Mocking
To deal with business coupling and test only functional code, we can use mock tools for data simulation.
The most common scenario is mocking requests. In general, you can use a Promise to mock request results, but sometimes you may need a more realistic scenario.
Common mock tools, such as APIfox, start a real server to return fake data based on interface definitions. Vitest does not start a real node server but intercepts requests to corresponding addresses using `mswjs`.
This allows you to easily simulate scenarios of "abnormal requests".
First, install msw: `pnpm install msw`

Suppose we need to request the `https://thorn.mock/test` endpoint to get the JSON data `{msg: 'hey'}`, here are our test cases.
```ts
/** /src/api/__test__/mock.test.ts */
import { describe, expect, it } from 'vitest'

describe('mock', async () => {
  it('mock api', async () => {
    const response = await fetch('https://thorn.mock/test') 
    // Use toEqual to compare object values
    expect(await response.json()).toEqual({
      msg: 'hey'
    })
  })
})
```

To mock this endpoint, we need to write a server following the syntax of msw.
```ts
/** /src/mocks/server.ts */
import { setupServer } from 'msw/node'
import { HttpHandler, HttpResponse, http } from 'msw'

export const handlers: Array<HttpHandler> = [
  http.get('https://thorn.mock/test', () => {
    return HttpResponse.json({
      msg: 'hey'
    })
  })
]

export const server = setupServer(...handlers)
```
Ideally, we want to start the mock server at the beginning of each test and shut it down at the end. Vitest provides four APIs to achieve this process.
In Vitest.config.ts, add the setupFiles option, which accepts `string|string[]` as file paths. The files written will be automatically executed each time Vitest starts.
```ts
defineConfig({
  test: {
    // ...
    setupFiles: './src/setup.ts'
    // ...
  }
})
```
In the setup.ts file, we call Vitest hooks:
```ts
import { server } from './mocks/server'
import { beforeAll, afterAll, afterEach } from 'vitest'

// Start the server before each test begins
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
// Close the server after each test ends
afterAll(() => server.close())
// Reset handlers after each test case
afterEach(() => server.resetHandlers())
```
When running the tests, it will show that the tests have passed.
![unit test pass](https://r2.ray-d-song.com/202312141529162.png)
Please note that since msw intercepts requests rather than starting a mock server, direct local calls will not work.
# Asynchronous Testing


# Optimizing the Testing Process
## Inline Testing
Just like inline styles, inline testing means writing test code alongside the source code.  
Let's modify the regular expression example:
```ts
/** /src/reg/phone.ts */
export function regChinesePhoneNumber(phoneNumber: string) {
  const regex = /^1[3456789]\d{9}$/
  return regex.test(phoneNumber)
}

// Inline tests should be 
// placed at the bottom of the source code
/**
  * To solve the ts error
  * Need to add in tsconfig.json
  * {"compilerOptions": {"types": ["vitest/importMeta"]}}
 */
if(import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('phone number belongs to Chinese', () => {
    expect(regChinesePhoneNumber('41772566381')).toBe(false)
  })
}
```
Then update the `vitest.config.ts` file.
```ts
export default defineConfig({
  test: {
    includeSource: ['src/**/*.{js,ts}'], 
  }
})
```
You can see that the new test case includes a file that does not end with `test.ts`.  
![in source test](https://r2.ray-d-song.com/202312141609782.png)
The downside of this approach is that it can lead to code bloat after bundling, but we can take some measures to ensure that code blocks are tree-shaken as blocks that won't be executed.
```ts
/** vite.config.ts */
export default defineConfig({
  define: {
    'import.meta.vitest': 'undefined', 
  }, 
})
```
## Type Testing (Experimental)
Type information in TypeScript is erased during compilation, meaning that no matter how comprehensive the type code is, it won't affect the actual JavaScript code that runs. However, type testing can encourage more sound type code, thereby enhancing the robustness of TypeScript projects.  
Overall, type testing is not commonly used, and here we only briefly introduce the general process.
```ts
/** /src/types/MPick.d.ts */
export type MPick<T, K extends keyof T> = {
  [P in K]: T[P]
}

/** /src/types/__test__/MPick.test-d.ts */

// vitest will scan .test-d.ts file auto
import { expectTypeOf, test } from 'vitest'
import type { MPick } from '../MPick'

test('test mock Pick', () => {
  interface Foo {
    a: string
    b: number
  }
  type Bar = MPick<Foo, 'a'>
  interface Exp {
    a: string
  }
  expectTypeOf<Bar>().toEqualTypeOf<Exp>()
})
```
To start type testing, you need to specify `--typecheck` at startup and add a new npm command `"test:type": "vitest --typecheck"`.  
Run `pnpm run test:type` to execute the tests.
## Visualization
Vitest provides a UI interface for interaction. Install it by running `pnpm install @vitest/ui`, and start it with `pnpm run test:unit --ui`.
![ui](https://r2.ray-d-song.com/202312141744611.png)
It covers almost all operations and allows you to view the console, source code, and dependency graph.
![Graph](https://r2.ray-d-song.com/202312141745142.png)
## Code Coverage
Vitest offers code coverage checking through V8. Install it by running `pnpm install @vitest/coverage-v8`.  
Configure the coverage options in the `vitest.config` file.
```ts
defineConfig({
  test: {
    coverage: {
      enabled: true,
      reporter: ['html']
    }
  }
})
```
This way, you can view the code coverage results in the UI interface.  
![coverage ui](https://r2.ray-d-song.com/202312141752020.png)

