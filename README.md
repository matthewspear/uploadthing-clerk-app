# Clerk Uploadthing Middleware Clash

## Solution 🎉

Check the commit [6cafe0a0](https://github.com/matthewspear/uploadthing-clerk-app/commit/6cafe0a0192b3ca8b83c7a5e3f67d3cc4987cf6a) changes to show what solved it, I'll also explain below

I'd like to say a massive thanks to the team at Clerk, specifically @perkinsjr who helped me get to the bottom if it.

- Run getAuth in the API before calling the handler
- Pass in any data you want into the body of the request

Endpoint at src/pages/api/uploadthing.ts:

```typescript
import { createNextPageApiHandler } from "uploadthing/next-legacy";
import { ourFileRouter } from "@/server/uploadthing";
import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = createNextPageApiHandler({
  router: ourFileRouter,
});

export default async function uploadthing(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Do something before the uploadthing handler runs
  const { userId } = getAuth(req);
  if (userId) {
    // add the userId to the body
    const body: any = req.body ? JSON.parse(req.body) : {};
    req.body = JSON.stringify({ ...body, userId });
  }
  await handler(req, res);
}
```

FileRouter  at src/server/uploadthing.ts:

```typescript
import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    // eslint-disable-next-line
    .middleware(async ({ req, res }) => {
      // This code runs on your server before upload
      try {
        // eslint-disable-next-line
        const { userId } = JSON.parse(req.body) as { userId: string };
	
		...

```

This removes the error and provides server side validation before upload.

So glad to have finally solved this, and I hope this is helpful!

## Problem

To see the problem checkout [b66996fc](https://github.com/matthewspear/uploadthing-clerk-app/commit/b66996fcb4a667792998e0ea4c7d775a80315501):

1. Copy .env.example and fill in environment variables
2. Install dependencies

	```
	pnpm i
	```

3. Head to http://localhost:3000/example-uploader and you'll be forced to login as it is not a public route

4. Try uploading a file and on the client you'll recieve an error:
	
	```
	ERROR! Failed to get presigned URLs
	```

5. In the terminal recieved error:

	```
	[UT] UploadThing dev server is now running!
	[UT] middleware failed to run
	Error: You need to use "authMiddleware" (or the deprecated "withClerkMiddleware") in your Next.js middleware file. You also need to make sure that your middleware matcher is configured correctly and matches this route or page. See https://clerk.com/docs/quickstarts/get-started-with-nextjs
	at /Users/mspear/Desktop/uploadthing-clerk-app/node_modules/.pnpm/@clerk+nextjs@4.21.10_next@13.4.2_react-dom@18.2.0_react@18.2.0/node_modules/@clerk/nextjs/dist/cjs/server/getAuth.js:45:13
	at /Users/mspear/Desktop/uploadthing-clerk-app/node_modules/.pnpm/@clerk+nextjs@4.21.10_next@13.4.2_react-dom@18.2.0_react@18.2.0/node_modules/@clerk/nextjs/dist/cjs/utils/debugLogger.js:55:19
	at Object.eval [as middleware] (webpack-internal:///(api)/./src/server/uploadthing.ts:22:88)
	at eval (webpack-internal:///(api)/./node_modules/.pnpm/uploadthing@5.0.0_zod@3.21.4/node_modules/uploadthing/dist/next-legacy.mjs:259:46)
	at processTicksAndRejections (node:internal/process/task_queues:96:5)
	at async eval (webpack-internal:///(api)/./node_modules/.pnpm/uploadthing@5.0.0_zod@3.21.4/node_modules/uploadthing/dist/next-legacy.mjs:360:22)
	 ```
  
---
> 🙏 I'd really appreciate your help with this – below I've listed a few thoughts, but the engineer in me would love to know why this is happening!

### Thoughts

- I have authMiddleware at `src/middleware.ts`
- I think it is a middleware clash between the Clerk and Uploadthing, or an incoming callback / webhook
- I can reach `http://localhost:3000/api/uploadthing` with a GET request and recieve:

	```json
	[
	  {
	    "slug": "imageUploader",
	    "config": {
	      "image": {
	        "maxFileSize": "4MB",
	        "maxFileCount": 1
	      }
	    }
	  }
	]
	```

- I've noticed on Vercel sometimes APIs are called `<domain>/en/api/<slug>` and wonder if that has any implication



# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
