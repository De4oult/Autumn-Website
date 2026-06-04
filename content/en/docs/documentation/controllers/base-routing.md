---
title: Basic Routing
description: An autumn path from a controller to the first HTTP route.
---

In Autumn, a controller is a regular Python class marked with `@REST()`. Controller methods become HTTP routes when they have an HTTP method decorator: `@get`, `@post`, `@put`, `@patch`, or `@delete`.

```python
from autumn.controller import REST, get
from autumn.response import JSONResponse

@REST()
class BaseController:
    @get('/healthcheck')
    async def get_healthcheck(self) -> JSONResponse:
        return JSONResponse({ 'health': True })
```

This registers:

```http
GET /healthcheck
```

## Controller Prefix

If several routes belong to one group, give them a shared prefix through `@REST(prefix = '...')`.

```python
@REST(prefix = '/users')
class UserController:
    @get
    async def get_user(self) -> JSONResponse:
        ...

    @post
    async def create_new(self) -> JSONResponse:
        ...
```

Final routes:

```http
GET  /users/
POST /users/
```

Autumn joins the controller `prefix` with the method path. If the method decorator receives no path, `/` is used, so the route points directly to the prefix:

```python
@REST(prefix = '/users')
class UserController:
    @get
    async def get_user(self) -> JSONResponse:
        ...
```

```http
GET /users
GET /users/
```

Both forms, with and without the trailing slash, are matched by the router.

## Short Form

If no path is passed, `/` is used.

```python
@REST(prefix = '/status')
class StatusController:
    @get
    async def index(self):
        return { 'ok' : True }
```

This method is available at:

```http
GET /status
```

## Return Values

A controller method can return a ready response object:

```python
from autumn.response import JSONResponse, HTMLResponse

@get('/json')
async def json_page(self):
    return JSONResponse({ 'ok' : True })

@get('/html')
async def html_page(self):
    return HTMLResponse('<h1>Hello</h1>')
```

It can also return a plain dictionary or a serializable object. Autumn will pass the value through its response handling mechanism.
