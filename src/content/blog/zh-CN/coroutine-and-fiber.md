---
title: '协程(Coroutine)和纤程(Fiber)'
date: '2023-09-13'
cover: ''
tag: ['Concurrent']
---
最近在看 C++ 引入 Fiber 的[N4024文档: 区分纤程和协程](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2014/n4024.pdf), 文章给纤程和协程十分明确的区分. 但过去我看过的很多资料会将其混为一谈或者模糊二者的边界, 所以写了这篇博客来总结一下.
# 纤程
线程是一种轻量级的线程, 本质是对线程时间进行切片处理, 调度也由用户进行. 最早是 Microsoft 为了解决 Unix 平台的引用程序移植到 Windows 上时出现的问题而发起的提案.
因此, 纤程是一种偏底层的概念, 通常由操作系统或runtime自动管理, 并不需要程序员手动干预. 例如 Windows 上的纤程就是在其内核上实现.
> 值得注意的是, php8 引入的 Fiber 虽然叫做纤程, 其本质是协程.

一个线程可以包含多个纤程, 纤程的好处是可以有效防止长时间的线程挂起. 例如在 IO 操作时, 实例化一个纤程进行 IO 操作, 在该纤程阻塞的过程中, 因为仅占用了一部分的时间切片, 程序依旧可以继续执行.

# 协程
协程的核心就是协作, 通过明确的挂起和恢复来控制执行的流程，使得不同任务之间可以更好地协同工作，共享信息，避免竞态条件，提高性能.
协程在许多语言中都有实现, 例如 `Lua、Go、Ruby、Java(Virtual Threads)`, `Python 和 JavaScript(基于生成器)`.
如果要用一句话来总结协程: `控制流的主动让出和恢复`.
## 有栈协程和无栈协程
协程有很多种, 按照多个协程之间是否存在调用栈, 可以分为`有栈协程(如goroutine、lua协程)`和`无栈协程(如JavaScript、Dart、Python)`.
> 调用栈的作用是保存协程挂起时的状态.
> 有栈协程在恢复时会将其上下文从栈内存中捞出恢复到系统栈中.
> 无栈协程的挂起和恢复则依赖闭包和状态机实现.

## 对称协程和非对称协程
非对称协程提供`两种控制操作`, `调用协程`和`挂起协程`. 非对称协程可以看做是其调用者的从属, 跟特定调用者绑定, 在让出控制权时, 只能回到原调用者.
对称协程提供`单个控制操作`, 可以通过该操作在协程之间显示的传递控制权. 对称协程在启动后和原调用者就没什么关系了, 也因此, 对称协程需要一个调度器去选择转移控制权操作的目标协程.
### 对称
对称协程的例子非常少, 以下是 C++ `Boost.Coroutine` 的示例.
```cpp
#include <iostream>
#include <coroutine>

struct CountingCoroutine {
    struct promise_type {
        int current_value = 0;

        CountingCoroutine get_return_object() {
            return CountingCoroutine(std::coroutine_handle<promise_type>::from_promise(*this));
        }

        std::suspend_always initial_suspend() { return {}; }
        std::suspend_always final_suspend() noexcept { return {}; }
        void return_void() {}
        void unhandled_exception() {}
        std::suspend_always yield_value(int value) {
            current_value = value;
            return {};
        }
    };

    std::coroutine_handle<promise_type> coroutine;

    CountingCoroutine(std::coroutine_handle<promise_type> handle) : coroutine(handle) {}

    ~CountingCoroutine() {
        if (coroutine)
            coroutine.destroy();
    }

    int getValue() const {
        return coroutine.promise().current_value;
    }

    void resume() {
        coroutine.resume();
    }
};

CountingCoroutine generateNumbers() {
    for (int i = 0; i < 10; ++i) {
        //移交控制权
        co_yield i;
    }
}

int main() {
    CountingCoroutine counter = generateNumbers();

    while (counter.coroutine) {
        std::cout << "Value: " << counter.getValue() << std::endl;
        //回到 co_yield 继续执行
        counter.resume();
    }

    return 0;
}
```
在 Go 语言中, 我们可以通过 chan 在没有特定从属关系的情况下完成协程间控制权的转移, 也算是对称协程的实现:
```go
func main() {
    ch1 := make(chan int)
    ch2 := make(chan int)

    var wg sync.WaitGroup

    wg.Add(1)
    go func() { // <--- 1
        defer wg.Done()
        for val := range ch1 {
            fmt.Println(val)
        }
    }()

    wg.Add(1)
    go func() { // <--- 2
        defer wg.Done()
        for val := range ch2 {
            ch1 <- val
        }
        close(ch1)
    }()

    wg.Add(1)
    go func() { // <--- 3
        defer wg.Done()
        for i := 1; i <= 5; i++ {
            ch2 <- i
        }
        close(ch2)
    }()

    wg.Wait()
}
```
如果按照代码的顺序执行, 那正确的排列顺序是 3 2 1, 但在此处由于channel的阻塞特性, 第一个goroutine会等待第二个goroutine将数据从 ch2 传输到 ch1, 而第二个goroutine会等待第三个goroutine将数据发送到 ch2, 这就保证了它们的执行顺序. 最后，当所有goroutine都完成并且WaitGroup计数为0时, wg.Wait() 返回, 程序退出.
### 非对称
JavaScript 的 async、await、promise 则是创建非对称协程的工具.
```javascript
// async 标记的函数会创建协程
const useFetch = async () => { 
  // 执行到 await 处会将该协程挂起, 直到 fetch 返回
  const res = await fetch('https://www.v2ex.com/api/topics/hot.json')
  return res.json()
}

const main = () => {
  console.log('main start')
  // 执行到此处, 控制权转移到协程
  useFetch().then(res => { 
    // 执行到函数内部 await 处, 暂时挂起, 控制权返回到 main
    console.log(`fetch res: ${res}`)
  })
  console.log('main end')
}

main()
/**
 * main start
 * main end
 * fetch res: ...
 */
```
可以看到, 在 JS 中, 协程转移的控制权一定会返回到协程的调用者上.


# 异同
看到这里, 会发现纤程和协程极为相似.
没错, 大框架上两者的基本概念是一样的. 仅有的区别是纤程的状态保存由操作系统API提供, 而协程保存和恢复的方式由语言或库提供, 背后的实现更是则多种多样.
所以我们可以认为: 纤程实际上就是由操作系统提供的协程.
参考[Distinguishing coroutines and fibers](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2014/n4024.pdf), 以下是一些细节的差别:
1. Fiber 在发起后不再依赖于发起它的程序存在, 可以拥有独立的生命周期.
	 Coroutine 作为发起者的「子程序」, 不存在独立的生命周期.
2. Fiber 和 Thread 行为模式基本一致. 存在一个调度器, 某个 Fiber 被阻塞, 会将控制权移交至调度器, 由调度器去唤起其他准备运行的 Fiber.
	 对称协程的行为方式和 Fiber 基本一致. 非对称协程不存在调度器, 控制权会回到发起者.
