Caching on Vercel's Edge Network
Vercel's Edge Network caches your content at the edge in order to serve data to your users as fast as possible. Learn how Vercel caches works in this guide.

Vercel's Edge Network caches your content at the edge in order to serve data to your users as fast as possible. Vercel's caching is available for all deployments and domains on your account, regardless of the pricing plan.

Vercel uses the Edge Network to cache your content globally and serve data to your users as quickly as possible. There are two ways to cache content:

    Static file caching is automatic for all deployments, requiring no manual configuration
    To cache dynamic content, including SSR content, you can use Cache-Control headers

How to cache responses

You can cache responses on Vercel with Cache-Control headers defined in:

    Responses from Vercel Functions
    Route definitions in vercel.json or next.config.js

You can use any combination of the above options, but if you return Cache-Control headers in a Vercel Function, it will override the headers defined for the same route in vercel.json or next.config.js.
Using Vercel Functions

To cache the response of Functions on Vercel's Edge Network, you must include Cache-Control headers with any of the following directives:

    s-maxage=N
    s-maxage=N, stale-while-revalidate=Z

proxy-revalidate and stale-if-error are not currently supported.

The following example demonstrates a function that caches its response and revalidates it every 1 second:
app/api/cache-control-example/route.ts
TypeScript

export async function GET() {
  return new Response('Cache Control example', {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=1',
      'CDN-Cache-Control': 'public, s-maxage=60',
      'Vercel-CDN-Cache-Control': 'public, s-maxage=3600',
    },
  });
}

For direct control over caching on Vercel and downstream CDNs, you can use CDN-Cache-Control headers.
Using vercel.json and next.config.js

You can define route headers in vercel.json or next.config.js files. These headers will be overridden by headers defined in Function responses.

The following example demonstrates a vercel.json file that adds Cache-Control headers to a route:
vercel.json

{
  "headers": [
    {
      "source": "/about.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=1, stale-while-revalidate=59"
        }
      ]
    }
  ]
}

If you're building your app with Next.js, you should use next.config.js rather than vercel.json. The following example demonstrates a next.config.js file that adds Cache-Control headers to a route:
next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/about',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=1, stale-while-revalidate=59',
          },
        ],
      },
    ];
  },
};
 
module.exports = nextConfig;

See the Next docs

to learn more about next.config.js.
Static Files Caching

Static files are automatically cached at the edge on Vercel's Edge Network for the lifetime of the deployment after the first request.

    If a static file is unchanged, the cached value can persist across deployments due to the hash used in the filename
    Optimized images cached will persist between deployments

Browser

    max-age=N, public
    max-age=N, immutable

Where N is the number of seconds the response should be cached. The response must also meet the caching criteria.
Cache control options

You can cache dynamic content through Vercel Functions, including SSR, by adding Cache-Control headers to your response. When you specify Cache-Control headers in a function, responses will be cached in the region the function was requested from.

See our docs on Cache-Control headers to learn how to best use Cache-Control directives on Vercel's Edge Network.
CDN-Cache-Control
Vercel supports two Targeted Cache-Control headers

:

    CDN-Cache-Control, which allows you to control the Vercel Edge Cache or other CDN cache separately from the browser's cache. The browser will not be affected by this header
    Vercel-CDN-Cache-Control, which allows you to specifically control Vercel's Edge Cache. Neither other CDNs nor the browser will be affected by this header

By default, the headers returned to the browser are as follows:

    Cache-Control
    CDN-Cache-Control

Vercel-CDN-Cache-Control headers are not returned to the browser or forwarded to other CDNs.

To learn how these headers work in detail, see our dedicated headers docs.

The following example demonstrates Cache-Control headers that instruct:

    Vercel's Edge Cache to have a TTL

    of 3600 seconds
    Downstream CDNs to have a TTL of 60 seconds
    Clients to have a TTL of 10 seconds

app/api/cache-control-headers/route.ts
TypeScript

export async function GET() {
  return new Response('Cache Control example', {
    status: 200,
    headers: {
      'Cache-Control': 'max-age=10',
      'CDN-Cache-Control': 'max-age=60',
      'Vercel-CDN-Cache-Control': 'max-age=3600',
    },
  });
}

If you set Cache-Control without a CDN-Cache-Control, the Vercel Edge Network strips s-maxage and stale-while-revalidate from the response before sending it to the browser. To determine if the response was served from the cache, check the x-vercel-cache header in the response.
Cacheable response criteria

The Cache-Control field is an HTTP header specifying caching rules for client (browser) requests and server responses. A cache must obey the requirements defined in the Cache-Control header.

For server responses to be successfully cached with Vercel's Edge Network, the following criteria must be met:

    Request uses GET or HEAD method.
    Request does not contain Range header.
    Request does not contain Authorization header.
    Response uses 200, 404, 301, 302, 307 or 308 status code.
    Response does not exceed 10MB in content length.
    Response does not contain the set-cookie header.
    Response does not contain the private, no-cache or no-store directives in the Cache-Control header.

Vercel does not allow bypassing the cache for static files by design.
Cache Invalidation

Every deployment has a unique key used for caching based on the deployment URL created at build time. This key ensures that users never see content from a previous deployment. It contains the following information:

    The request method (such as GET, POST, etc)
    The request URL (query strings are ignored for static files)
    The host domain
    The unique deployment URL
    The scheme (whether it's https or http)
    The accept header (Image Optimization requests only)

The cache is automatically purged upon a new deployment being created. If you ever need to invalidate Vercel's Edge Network cache, you can always re-deploy.
x-vercel-cache

The x-vercel-cache header is included in HTTP responses to the client, and describes the state of the cache.

See our headers docs to learn more.
Limits

Vercel's Edge Network cache is segmented by region. The following caching limits apply to Vercel Function responses:

    Max cacheable response size:
        Streaming functions: 20MB
        Non-streaming functions: 10MB
    Max cache time: 1 year
        s-maxage
        max-age
        stale-while-revalidate

While you can put the maximum time for server-side caching, cache times are best-effort and not guaranteed. If an asset is requested often, it is more likely to live the entire duration. If your asset is rarely requested (e.g. once a day), it may be evicted from the regional cache.
proxy-revalidate and stale-if-error

Vercel does not currently support using proxy-revalidate and stale-if-error for server-side caching.
Last updated on March 12, 2025