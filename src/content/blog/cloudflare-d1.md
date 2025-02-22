---
title: 'cloudflare worker/D1 初探'
date: '2023-11-18'
cover: ''
tag: ['Serverless']
---
# 创建项目
如果是第一次使用 worker 服务, 需要登录一下
```bash
npx wrangler login
```
通过命令行交互创建一个名为 event-tracking 的项目
```bash
npm create cloudflare@latest event-tracking
```
项目创建完成后有两个关键的文件, `src/index.ts` 是 worker 的入口, `wrangler.toml` 是总的配置文件.  
进入 dev01 目录, 执行命令创建数据库
```bash
npx wrangler d1 create event-tracking-db
```
执行上面的命令会生成类似如下内容, 粘贴到`wrangler.toml`中即可配置项目的数据库连接
```toml
[[d1_databases]]
binding = "DB"
database_name = "event-tracking-db"
database_id = "xxxxxxxxx-xxxxx-xxxx-xxxx-xxxxxxxxxxxxx"
```
在项目的根目录下创建 sql/schema.sql 文件用于初始化数据库
```sql
DROP TABLE IF EXISTS view_tracking;

CREATE TABLE IF NOT EXISTS view_tracking
(article_id CHAR(13) PRIMARY KEY, view_count INT);

INSERT INTO view_tracking (article_id, view_count) values ('1692667782462', 1);
```
执行以下命令在本地创建数据库进行测试
```bash
npx wrangler d1 execute event-tracking-db --local --file=./sql/schema.sql
```
所谓本地数据库其实是`.wrangler/state/d1/miniflare-D1DatabaseObject`文件夹下创建了一个 sqlite.  
所以你可以用自己的数据库软件比如 datagrip 验证操作是否成功.

# worker 操作数据库
我的需求是每次用户访问文章, 前端将文章拼接在路径参数中请求后端, 后端为文章的阅读量 + 1 后返回阅读量给前端.  
修改我们的 worker 文件, 先完成获取 articleId 并将其原样返回的步骤.
```ts
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const articleId = request.url.split('/').pop()

		return new Response(articleId)
	}
}
```
## 单测
接下来我们对这个简单的 worker 运行测试.  
我这里选择使用 Vitest, 它和 TS 的集成度更高且性能更好. 你可以通过我这篇文章来了解它[在 Vue 项目中使用 Vitest](https://ray-d-song.com/post/1701870426245)
```ts
import { unstable_dev, type UnstableDevWorker } from 'wrangler'
import { describe, beforeAll, afterAll, it, expect } from 'vitest'

describe('Event Tracking', () => {
  let worker: UnstableDevWorker

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true }
    })
  })

  afterAll(async () => {
    await worker?.stop()
  })

  it('should return path param', async () => {
    const response = await worker.fetch('https://thorn.com/post/1701870426245')
    const str = await response.text()
    expect(str).toBe('1701870426245')
  })

})
/**
 *  Test Files  1 passed (1)
 *  Tests  1 passed (1)
 *  Start at  10:59:31
 *  Duration  524ms
 */
```
## 查询
在创建数据库时, 我们插入了初试数据, 利用这个数据进行查询测试:
```ts
/** index.ts */
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const articleId = request.url.split('/').pop()

    const result = await env.DB.prepare(
      'SELECT view_count FROM view_tracking WHERE article_id = ?'
    )
      .bind(articleId)
      .first()
    
		return new Response(String(result===null?0:result['view_count']))
	}
}

/** index.test.ts */

// 将第一个用例标记为 skit, 跳过该测试
it.skip('should return path param', async () => {
  const response = await worker.fetch('https://thorn.com/post/1701870426245')
  const str = await response.text()
  expect(str).toBe('1701870426245')
})

it("should return '1'", async () => {
  const response = await worker.fetch('https://thorn.com/post/1692667782462')
  const str = await response.text()
  expect(str).toBe('1')
})

/**
 *  ✓ src/index.test.ts (2)
 *  ✓ Event Tracking (2)
 *    ↓ should return path param [skipped]
 *    ✓ should return '1'
*/
```
## 更新
我们继续在此基础上修改, 在查询数据前, 我们需要为该数据的阅读数 + 1.  
该连续操作并不需要强一致, 因此只需要在之前的操作前再加一条更新操作即可. D1 提供了自己的批处理语法.
```ts
/** index.ts */
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const articleId = request.url.split('/').pop()

    const db = env.DB
    const batchRes = await db.batch([
      db.prepare('UPDATE view_tracking SET view_count=view_count+1 WHERE article_id = ?').bind(articleId),
      db.prepare('SELECT view_count FROM view_tracking WHERE article_id = ?').bind(articleId)
    ])

    const viewCountVal = batchRes[1]===null ? 0 : (batchRes[1].results[0] as ViewCountObj)['view_count']
		return new Response(String(viewCountVal))
	}
}
```
为了测试每次请求阅读数是否真的+1, 本来应该提供一个新的只读接口, 但为了偷懒我们可以打印每次的结果, 自己观察一下即可:
```ts
/** index.test.ts */
it("should return new view_count", async () => {
  const response = await worker.fetch('https://thorn.com/post/1692667782462')
  const str = await response.text()
  console.log(str)
  expect(str).toBeTypeOf('string')
})
```
到这里该接口的编写基本完成.

## 写入
为了每次发布新的文章都自动插入数据, 我们还需要另一个插入数据接口.  
博客每次执行发布的 actions, 就调用该接口将新的 article_id 写入数据库.  
每个 worker 仅能完成一个工作, 需要的接口就需要创建新的 worker. 为了偷懒我们对之前的 worker 进行改造, 根据倒数第二个参数判断操作类型, 最后一个路径参数作为 article_id.
```ts
/** /src/index.ts */
import createHandler from './handlers/create'
import readHandler from './handlers/read'

export interface Env {
  DB: D1Database
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = request.url.split('/')
      const articleId = url.pop()
      const handleType = url.pop()
      if(articleId?.length !== 13) {
        throw { code: 400, msg: 'err param' }
      }
      switch (handleType){
        case 'read':
          return readHandler(articleId, env)
        case 'create':
          return createHandler(articleId, env)
        default:
          throw { code: 400, msg: 'err handle type' }
      }
    } catch(e: any) {
      return new Response(e.msg, {status: e.code})
    }
  }
}

/** /src/handlers/create.ts */
import { Env } from '..';

export default async function createHandler(articleId: string, env: Env) {
  const db = env.DB
  const execRes = await db.prepare('INSERT INTO view_tracking (article_id, view_count) values (?, 1)')
    .bind(articleId)
    .run()
  if(execRes.error) {
    throw { code: 500, msg: 'err exec'}
  }
  return new Response(null, {status: 200})
}

/** /src/handlers/read.ts */
import { Env } from '..'

interface ViewCountObj {
  view_count: number
}

export default async function readHandler(articleId: string, env: Env): Promise<Response> {
  const db = env.DB
  const batchRes = await db.batch([
    db.prepare('UPDATE view_tracking SET view_count=view_count+1 WHERE article_id = ?').bind(articleId),
    db.prepare('SELECT view_count FROM view_tracking WHERE article_id = ?').bind(articleId)
  ])

  const viewCountVal = batchRes[1]===null ? 0 : (batchRes[1].results[0] as ViewCountObj)['view_count']
  return new Response(String(viewCountVal))
}
```
对应的单测文件如下:
```ts
/** /src/__test__/index.test.ts */
import { unstable_dev, type UnstableDevWorker } from 'wrangler'
import { describe, beforeAll, afterAll, it, expect } from 'vitest'

describe('Event Tracking', () => {
  let worker: UnstableDevWorker

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true }
    })
  })

  afterAll(async () => {
    await worker?.stop()
  })

  // ...

  it('should return 200', async () => {
    const response = await worker.fetch('https://thorn.com/create/1701870426247')
    const code = response.status
    console.log(await response.text())
    expect(code).toBe(200)
  })
})
```

# 部署
首先将数据库创建 sql文件发布
```bash
npx wrangler d1 execute event-tracking-db --file=./sql/schema.sql 
```
验证是否成功
```bash
npx wrangler d1 execute event-tracking-db --command="SELECT * FROM view_tracking"
```
不出意外会出现这玩意
![result image](https://r2.ray-d-song.com/202312151552033.png)
最后发布你的 worker
```bash
npx wrangler deploy
```
成功提示
![success](https://r2.ray-d-song.com/202312151618252.png)

> 本博客为服务端渲染, 客户端不会直接调用 worker 接口. 如果你的 app 是 spa, 请记得添加一些防刷操作和入参判断拦截.
