---
title: 'Cloudflare Worker/D1 Exploration'
date: '2023-11-18'
cover: ''
tag: ['Serverless']
---

# Project Creation
If you are using the worker service for the first time, you need to log in
```bash
npx wrangler login
```
Create a project named event-tracking interactively through the command line
```bash
npm create cloudflare@latest event-tracking
```
After the project is created, there are two key files, `src/index.ts` is the entry point of the worker, and `wrangler.toml` is the overall configuration file.  
Go to the dev01 directory and execute the command to create a database
```bash
npx wrangler d1 create event-tracking-db
```
Executing the above command will generate content similar to the following, paste it into `wrangler.toml` to configure the project's database connection
```toml
[[d1_databases]]
binding = "DB"
database_name = "event-tracking-db"
database_id = "xxxxxxxxx-xxxxx-xxxx-xxxx-xxxxxxxxxxxxx"
```
Create a sql/schema.sql file in the root directory of the project to initialize the database
```sql
DROP TABLE IF EXISTS view_tracking;

CREATE TABLE IF NOT EXISTS view_tracking
(article_id CHAR(13) PRIMARY KEY, view_count INT);

INSERT INTO view_tracking (article_id, view_count) values ('1692667782462', 1);
```
Execute the following command to create a database locally for testing
```bash
npx wrangler d1 execute event-tracking-db --local --file=./sql/schema.sql
```
The so-called local database is actually a sqlite created under the `.wrangler/state/d1/miniflare-D1DatabaseObject` folder.  
So you can use your own database software like datagrip to verify if the operation was successful.

# Worker Database Operations
My requirement is that every time a user visits an article, the frontend concatenates the article in the path parameter to request the backend, and the backend increments the article's view count by 1 and returns the view count to the frontend.  
Modify our worker file to first complete the steps of obtaining articleId and returning it as is.
```ts
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const articleId = request.url.split('/').pop()

		return new Response(articleId)
	}
}
```

## Unit Testing
Next, we will run tests on this simple worker.  
I choose to use Vitest here, which has better integration with TS and performance. You can learn more about it in my article [Using Vitest in Vue Projects](https://ray-d-song.com/post/1701870426245)
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

## Query
When creating the database, we inserted initial data. Use this data for query testing:
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

// Mark the first test case as skit, skip the test
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

## Update
We continue to modify on this basis. Before querying the data, we need to increment the view count for that data by 1.  
This consecutive operation does not require strong consistency, so we only need to add an update operation before the previous operation. D1 provides its own batch processing syntax.
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

To test if the view count is really incremented by 1 for each request, we should provide a new read-only interface. However, for simplicity, we can print the result each time and observe it ourselves:
```ts
/** index.test.ts */
it("should return new view_count", async () => {
  const response = await worker.fetch('https://thorn.com/post/1692667782462')
  const str = await response.text()
  console.log(str)
  expect(str).toBeTypeOf('string')
})
```

At this point, the implementation of this interface is basically complete.

## Write
To automatically insert data each time a new article is published, we need another data insertion interface.  
Whenever the blog executes the publish actions, it calls this interface to write the new article_id into the database.  
Each worker can only perform one task, so a new worker needs to be created for the required interface. For simplicity, we modify the previous worker to determine the operation type based on the penultimate parameter, with the last path parameter as the article_id.
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

The corresponding unit test file is as follows:
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

# Deployment
First, publish the database creation sql file
```bash
npx wrangler d1 execute event-tracking-db --file=./sql/schema.sql 
```
Verify if successful
```bash
npx wrangler d1 execute event-tracking-db --command="SELECT * FROM view_tracking"
```
You should see something like this without any issues
![result image](https://r2.ray-d-song.com/202312151552033.png)

Finally, deploy your worker
```bash
npx wrangler deploy
```
Successful prompt
![success](https://r2.ray-d-song.com/202312151618252.png)

This blog is for server-side rendering, the client will not directly call the worker interface. If your app is a single-page application (SPA), please remember to add some anti-scraping operations and input parameter interception.
