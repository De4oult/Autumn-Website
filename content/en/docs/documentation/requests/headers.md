---
title: Headers
description: Read and set HTTP headers without extra rustle in your handlers.
---

HTTP headers are available through the `Request` object. To receive the request in a controller method, add a `request: Request` argument.

```python
from autumn import Request
from autumn.controller import REST, get

@REST(prefix = '/profile')
class ProfileController:
    @get('/me')
    async def me(self, request: Request):
        authorization = request.header('authorization')

        return {
            'authorization': authorization
        }
```

## Reading One Header

Use `request.header(name)` to read a single header.

```python
token  = request.header('authorization')
accept = request.header('accept')
```

It returns a string or `None` if the header was not passed.

```python
if request.header('authorization') is None:
    return { 'authorized': False }
```

Header names can be passed in any case:

```python
request.header('Authorization')
request.header('authorization')
request.header('AUTHORIZATION')
```

Autumn normalizes header names to lowercase internally.

## All Request Headers

All headers are available through `request.headers`.

```python
@REST(prefix = '/debug')
class DebugController:
    @get('/headers')
    async def headers(self, request: Request):
        return {
            'headers': request.headers
        }
```

`request.headers` is a dictionary with lowercase keys.

```python
{
    'host'          : 'localhost:8080',
    'accept'        : 'application/json',
    'authorization' : 'Bearer token'
}
```

## Headers in Middleware

Headers can be read in middleware as well as controllers.

```python
from autumn import Request, middleware

@middleware
async def log_request(request: Request, call):
    print(request.method, request.path, request.header('user-agent'))

    return await call(request)
```

This is useful for logging, authorization, and shared request handling.

## Response Headers

Response headers are set on the response object.

```python
from autumn import middleware
from autumn.controller import REST, get

@REST(prefix = '/users')
class UserController:
    @middleware.after
    def stamp(self, response) -> None:
        response.headers['X-Controller'] = 'users'

    @get('/current')
    async def current(self):
        return { 'ok': True }
```

Each response from this controller receives:

```http
X-Controller: users
```

Headers can also be passed when creating a response object, if the specific response class supports it.

```python
from autumn.response import JSONResponse

@get('/healthcheck')
async def healthcheck(self):
    return JSONResponse(
        { 'health': True },
        headers = { 'X-Service': 'autumn' }
    )
```

## CORS and allowed_headers

If the application accepts browser requests with custom headers, they must be allowed in CORS configuration.

```python
from autumn.configuration import CORSConfiguration

class MyCORSConfiguration(CORSConfiguration):
    allowed_origins = ['*']
    allowed_methods = ['POST']
    allowed_headers = ['authorization']
```

This allows the browser to send the `authorization` header in CORS requests.
