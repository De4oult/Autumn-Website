---
title: Custom Response Classes
description: Create your own responses for repeated formats and headers.
---

All Autumn response types are built around the base `Response` class. If the standard responses are not enough, you can create your own.

```python
from autumn.response import Response

class TextResponse(Response):
    def __init__(self, body: str, status: int = 200):
        super().__init__(
            body         = body,
            status       = status,
            content_type = 'text/plain; charset=utf-8'
        )
```

Use it from a handler:

```python
from autumn.controller import REST, get

@REST()
class TextController:
    @get('/text')
    async def text(self):
        return TextResponse('Hello')
```

## What Response Stores

The base `Response` contains:

```python
response.body
response.status
response.content_type
response.headers
```

Minimal example:

```python
from autumn.response import Response

@get('/plain')
async def plain(self):
    return Response(
        body         = 'Hello',
        status       = 200,
        content_type = 'text/plain; charset=utf-8',
        headers      = { 'X-Mode': 'plain' }
    )
```

## JSON Response Based on a Class

A class-based response is convenient when one response format is reused in multiple controllers.

```python
from autumn.response import JSONResponse

class OkResponse(JSONResponse):
    def __init__(self, data = None, status: int = 200):
        super().__init__(
            {
                'ok': True,
                'data': data
            },
            status = status
        )
```

Usage:

```python
@get('/profile')
async def profile(self):
    return OkResponse({ 'name': 'Dima' })
```

Response:

```json
{
    "ok": true,
    "data": {
        "name": "Dima"
    }
}
```

## Headers in a Class-Based Response

Headers can be passed to `super().__init__`.

```python
class CachedJSONResponse(JSONResponse):
    def __init__(self, body, max_age: int = 60):
        super().__init__(
            body,
            headers={
                'Cache-Control': f'public, max-age={max_age}'
            }
        )
```

Now any handler can return cacheable JSON:

```python
@get('/settings')
async def settings(self):
    return CachedJSONResponse({ 'theme' : 'dark' }, max_age = 300)
```

## Streaming Response

Autumn sends a response as a stream if the object has an async `body_iterate()` method. This is how `StreamFileResponse` works.

```python
from autumn.response import Response

class ChunkedTextResponse(Response):
    def __init__(self):
        super().__init__(
            body         = b'',
            status       = 200,
            content_type = 'text/plain; charset=utf-8'
        )

    async def body_iterate(self):
        yield b'first\n'
        yield b'second\n'
        yield b'third\n'
```

Usage:

```python
@get('/stream')
async def stream(self):
    return ChunkedTextResponse()
```

If `body_iterate()` exists, Autumn sends chunks one by one and completes the response with an empty final chunk.

## When to Create a Custom Response

Create a custom response class when the same format appears in several places:

- a shared `{ ok, data }` envelope;
- repeated cache headers;
- a specific `content_type`;
- stream responses;
- integration with an external format.

For regular JSON, returning a `dict` or using `JSONResponse` is usually enough.
