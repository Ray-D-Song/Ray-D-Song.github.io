---
title: 'Single-threaded Concurrency'
date: '2023-08-17'
cover: ''
tag: ['Concurrent']
---
> The cover and ideas in this article are inspired by the sharing of Captain Dongxian at Ruby China 2021: [Ruby High-Concurrency Programming Guide](https://www.bilibili.com/video/BV1h3411v7kq/?spm_id_from=333.999.0.0&vd_source=371668a779fa4a755fcbf62901a22d71)

# Concurrency
Imagine a processor with only one core, so it can only run one process at a time. Since only one thread (task) can run on a process at the same time, you can think that at any given time, this processor can only handle one task.

The operating system divides the resource of `CPU usage time` through a process called `time slicing`. The allocated resources are distributed to various threads to use according to scheduling algorithms. The feeling of thread switching within a process is something like this:
![Thread Scheduling](https://r2.ray-d-song.com/2024/02/1674c2a68a1f5732789d854fce7ce515.png)

Because modern computers have powerful performance, users feel like task_1, 2, 3 are running simultaneously, which is concurrency.

I don't want to use the vague expression of "multiple tasks happening simultaneously." In my opinion, the reason why "concurrency" is called "concurrency" is simply a translation issue in Chinese.  
`Anyway, only one task is actually being executed at the same time`

# Parallelism
Parallelism is easier to understand. If you have a multi-core processor, for example, an old E6600 with two cores, since it has two cores, it can run two processes simultaneously, with each process running one thread. Therefore, your computer can truly run two tasks at the same time.  
It feels something like this:
![Parallelism](https://r2.ray-d-song.com/2024/02/dca335668b68d1e7e0c5f0071e9ccc23.png)

# Program Design
While browsing Zhihu before, I came across a statement like this: "Your program must first support concurrency before it can support parallelism."  
Because concurrency is not only a way to describe the state of program execution but also a methodology for program design:  
The condition for designing concurrent programs is that "the program's execution does not depend on order or precise timing."  
And a program that does not depend on order or precise timing can naturally be divided into multiple segments to run on multiple threads. These threads can run on different processes, thereby achieving `parallelism`.

Let's first look at the most common web application scenario, from receiving a user request to responding, requiring these steps:
![web app](https://r2.ray-d-song.com/202309092334861.png)
The `DB operation` occupies the largest space because database operations are indeed the most time-consuming.

# Multi-threaded Concurrency
Let's consider an extreme scenario: if only one thread is running all the time, the process will look like this:
![Single Thread](https://r2.ray-d-song.com/202309092339287.png)
If that's the case, I think our single-core machine will burn out with just a few users.
To address this situation, the simplest idea is to open multiple threads. Although we have only one process, when the first thread is stuck in a database operation, the control can be transferred to other threads for operation.
![Multi-threaded](https://r2.ray-d-song.com/202309092351360.png)

# Coroutines
Multi-threaded concurrency seems great, but there are two problems: the number of threads a computer can start is limited, and thread switching has an objective cost.
So, what if we can "simulate threads" in our program, where the switch is not between threads but between executing program methods? Wouldn't that allow for concurrency at a very low cost?
This simulated thread, or `lightweight thread/user thread`, is called a coroutine.
With coroutines, we can have more fine-grained control over program execution. Here is an example of node.js coroutine (async):
```js
async function App(request, response) {
  const id = request.query.id // <- read req and parsing
  try {
    const result = await DB.find({ id }) // <- DB operation
    res.json({ // generate json and response
      code: 200,
      data: result
    })
  } catch(e) {
    // ...
  }
}
```
When the program reaches a database operation marked with `await`, it will block within the current method, waiting for the database's return result. But for the method calling App(), the program will continue to execute downward (handling other requests).

A simplified diagram of the entire process looks something like this:
![async](https://r2.ray-d-song.com/202309101809693.png)

For a more detailed introduction to coroutines, you can refer to my article [Coroutines and Fibers](https://ray-d-song.com/post/1692667782462).

In fact, this "single-thread + coroutine" concurrency model is the concurrency model of Node.js.
In recent years, coroutines have gained popularity, with jdk21 and php8 both supporting coroutine solutions. This is enough to demonstrate the advantages of this model.

> Speaking of this, is there a stronger solution than single-threaded asynchronous concurrency?
> That would be `multi-threading + coroutines`, which is the approach taken by Go. Go implements a more complex mapping of Goroutines to actual thread resources, allowing it to achieve terrifying concurrency performance with very low configuration. 
