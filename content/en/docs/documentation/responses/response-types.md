---
title: Response Types
description: Choose the response shape that carries data to the client best.
---

An Autumn handler can return a ready response object or a value the framework can automatically convert to JSON.

```python
from autumn.controller import REST, get
from autumn.response import JSONResponse

@REST()
class BaseController:
    @get('/healthcheck')
    async def get_base(self) -> JSONResponse:
        return JSONResponse({ 'health' : True })
```

## Automatic JSON

If a method returns a `dict`, `list`, Pydantic model, or object marked with `@serializable`, Autumn wraps it in `JSONResponse`.

```python
@REST(prefix = '/users')
class UserController:
    @get('/{id:int}')
    async def get_user(self, id: int):
        return { 'user_id' : id }
```

The response is sent as JSON:

```json
{
    "user_id": 1
}
```

## JSONResponse

Use `JSONResponse` when you want to return JSON explicitly, set status, or set headers.

```python
from autumn.response import JSONResponse

@get('/users')
async def users(self):
    return JSONResponse(
        { 
            'items': [] 
        },
        status  = 200,
        headers = { 'X-Source': 'cache' }
    )
```

`JSONResponse` uses Autumn JSON serialization, so it can handle Pydantic models and `@serializable` objects.

## HTMLResponse

`HTMLResponse` returns HTML.

```python
from autumn.response import HTMLResponse

@get('/hello')
async def hello(self):
    return HTMLResponse('<h1>Hello</h1>')
```

Content type:

```http
text/html; charset=utf-8
```

## XMLResponse

`XMLResponse` returns XML.

```python
from autumn.response import XMLResponse

@get('/feed')
async def feed(self):
    return XMLResponse('<feed><title>Autumn</title></feed>')
```

Content type:

```http
application/xml
```

## RedirectResponse

`RedirectResponse` sends a redirect and sets the `Location` header.

```python
from autumn.response import RedirectResponse

@get('/old-page')
async def old_page(self):
    return RedirectResponse('/new-page')
```

The default status is `302`.

```python
return RedirectResponse('/new-page', status = 301)
```

## FileResponse

`FileResponse` reads a file fully and sends it in the response.

```python
from autumn.response import FileResponse

@get('/file/report')
async def download_file(self):
    return FileResponse(
        path     = 'report.pdf',
        download = True
    )
```

If `download = True`, the file is sent as an attachment. If `download = False`, the browser may open it inline if it supports the file type.

`content_type` is detected from the filename automatically, but can be set explicitly.

```python
return FileResponse(
    path         = 'data.bin',
    filename     = 'export.bin',
    content_type = 'application/octet-stream'
)
```

## StreamFileResponse

`StreamFileResponse` sends a file in chunks. It is a better fit for large files.

```python
from autumn.response import StreamFileResponse

@get('/file/large-archive')
async def stream_file(self):
    return StreamFileResponse(
        path       = 'large-archive.zip',
        download   = True,
        chunk_size = 5 * 1024
    )
```

Unlike `FileResponse`, the file is not read fully into memory before being sent.

## Base Response

`Response` is the base class for a simple text or binary response.

```python
from autumn.response import Response

@get('/plain')
async def plain(self):
    return Response(
        'Hello',
        status       = 200,
        content_type = 'text/plain; charset=utf-8'
    )
```

If a handler returns a type Autumn cannot normalize into a response, a runtime error is raised.
