---
title: 'Coroutines and Fibers'
date: '2023-09-13'
cover: ''
tag: ['Concurrent']
---
Recently, I have been reading the document [N4024: Distinguishing coroutines and fibers](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2014/n4024.pdf) about the introduction of Fibers in C++. The document clearly distinguishes between fibers and coroutines, which is different from many resources I have encountered in the past that tend to blur the lines between them. Therefore, I decided to write this blog post to summarize the differences.

# Fibers
A fiber is a lightweight thread that essentially slices the thread's time for processing, and the scheduling is done by the user. It was originally proposed by Microsoft to address issues when porting reference programs from Unix platforms to Windows.
Therefore, fibers are a somewhat low-level concept, typically managed automatically by the operating system or runtime and do not require manual intervention by programmers. For example, fibers on Windows are implemented in its kernel.
> It is worth noting that although the Fiber introduced in PHP8 is called a fiber, its essence is a coroutine.

A thread can contain multiple fibers, and the advantage of fibers is that they can effectively prevent long thread suspensions. For example, during IO operations, instantiating a fiber for IO operations allows the program to continue executing while the fiber is blocked, as it only occupies a portion of the time slice.

# Coroutines
The core of coroutines is cooperation, controlling the flow of execution through explicit suspension and resumption, enabling better collaboration between different tasks, sharing information, avoiding race conditions, and improving performance.
Coroutines are implemented in many languages, such as `Lua, Go, Ruby, Java (Virtual Threads)`, `Python, and JavaScript (based on generators)`.
If coroutines were to be summarized in one sentence: `actively yielding and resuming control of the flow`.

## Stackful Coroutines and Stackless Coroutines
Coroutines come in various forms, based on whether there is a call stack between multiple coroutines, they can be categorized as `stackful coroutines (e.g., goroutines, Lua coroutines)` and `stackless coroutines (e.g., JavaScript, Dart, Python)`.
> The call stack is used to save the state of the coroutine when suspended.
> Stackful coroutines restore their context from stack memory to the system stack upon resumption.
> Stackless coroutines rely on closures and state machines for suspension and resumption.

## Symmetric Coroutines and Asymmetric Coroutines
Asymmetric coroutines provide `two control operations`, `call coroutine` and `suspend coroutine`. Asymmetric coroutines can be seen as subordinate to their caller, bound to a specific caller, and when yielding control, can only return to the original caller.
Symmetric coroutines provide `a single control operation` that allows explicit transfer of control between coroutines. Once started, symmetric coroutines are independent of the original caller, requiring a scheduler to select the target coroutine for control transfer.
### Symmetric
There are very few examples of symmetric coroutines, one of which is the C++ `Boost.Coroutine` example.
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
        // Transfer of control
        co_yield i;
    }
}

int main() {
    CountingCoroutine counter = generateNumbers();

    while (counter.coroutine) {
        std::cout << "Value: " << counter.getValue() << std::endl;
        // Return to co_yield and continue execution
        counter.resume();
    }

    return 0;
}
```
In the Go language, we can use channels to transfer control between coroutines without a specific dependency, which is also an implementation of symmetric coroutines:
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
If executed in order, the correct sequence would be 3 2 1. However, due to the blocking nature of channels, the first goroutine will wait for the second goroutine to transfer data from ch2 to ch1, and the second goroutine will wait for the third goroutine to send data to ch2, ensuring their execution order. Finally, when all goroutines are completed and the WaitGroup count is 0, wg.Wait() returns, and the program exits.
### Asymmetric
JavaScript's async, await, and promise are tools for creating asymmetric coroutines.
```javascript
// Functions marked with async will create coroutines
const useFetch = async () => { 
  /**
   * When executed to the await point
   * the coroutine will be suspended until fetch returns
   */
  const res = await fetch('https://www.v2ex.com/api/topics/hot.json')
  return res.json()
}

const main = () => {
  console.log('main start')
  /**
   * Execution reaches this point,
   * control is transferred to the coroutine
   */ 
  useFetch().then(res => { 
    /**
     * When executing to the `await` inside the function,
     * it is temporarily suspended,
     * and control is returned to the main
     */
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
In JS, it is guaranteed that the control will return to the caller of the coroutine.

# Similarities and Differences
Upon reaching this point, you may notice that fibers and coroutines are very similar.
Indeed, at a high level, the basic concepts of both are the same. The only difference is that the state preservation of fibers is provided by the operating system API, while the way coroutines save and restore state is provided by the language or library, with a variety of implementations behind the scenes.
Therefore, we can consider: fibers are essentially coroutines provided by the operating system.
Referring to [Distinguishing coroutines and fibers](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2014/n4024.pdf), here are some detailed differences:
1. Once initiated, a Fiber no longer depends on the program that initiated it and can have an independent lifecycle.
   Coroutines, as "subroutines" of the initiator, do not have an independent lifecycle.
2. The behavior pattern of Fibers is similar to Threads. There is a scheduler, and when a Fiber is blocked, control is transferred to the scheduler, which then wakes up other ready-to-run Fibers.
   The behavior of symmetric coroutines is similar to Fibers. Asymmetric coroutines do not have a scheduler, and control returns to the initiator.
