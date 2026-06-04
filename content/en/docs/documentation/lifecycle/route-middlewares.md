---
title: Route Middleware
description: Attach middleware to specific routes, like leaves to their branches.
---

Route middleware is `@middleware`, `@middleware.before()`, or `@middleware.after()` limited by a specific route, method, or both.

Route middleware is declared at module level, so the function receives `request` and `call`. If the same decorator is used inside a `@REST` class, Autumn recognizes the controller method and registers controller middleware instead.

```python
from autumn import Request, middleware

@middleware(
    path   = '/users/current/{name:str}', 
    method = 'GET'
)
async def current_user_guard(request: Request, call):
    print('Current user route')

    return await call(request)
```

This middleware runs only for requests whose path matches the template, for example:

```http
GET /users/current/dima
```

## Filtering by path

The `path` parameter sets a route template.

```python
@middleware(path = '/users/current/{name:str}')
async def only_current_user(request: Request, call):
    return await call(request)
```

Path parameters in middleware templates are written the same way as routes:

```python
'/users/current/{name:str}'
```

When matching middleware, Autumn replaces segments in curly braces with `[^/]+`, so the middleware applies to any value in that segment.

```http
GET /users/current/dima
GET /users/current/alex
```

## Filtering by method

The `method` parameter limits middleware to an HTTP method.

```python
@middleware(method = 'POST')
async def only_post(request: Request, call):
    return await call(request)
```

This middleware applies to `POST` requests.

Usually `method` is used together with `path` to bind middleware to a specific handler.

```python
@middleware.after(path = '/users/test', method = 'POST')
async def log_create_user(request: Request, response):
    print('<< Response sent:', response.status)

    return response
```

`path` and `method` can be a string or a list/tuple of strings.

```python
@middleware(
    path   = ('/users', '/profiles'),
    method = ['GET', 'POST']
)
async def users_or_profiles(request: Request, call):
    return await call(request)
```

## Before for One Route

`@middleware.before(path = ..., method = ...)` is useful for checks before one route handler.

```python
from autumn.response import JSONResponse

@middleware.before(path = '/admin/users', method = 'GET')
async def admin_guard(request: Request, call):
    if request.header('authorization') is None:
        return JSONResponse({ 'error': 'Unauthorized' }, status = 401)

    return await call(request)
```

If middleware returns a response without calling `call`, the route handler is not called.

## After for One Route

`@middleware.after(path = ..., method = ...)` is useful for logging or modifying the response of one route.

```python
@middleware.after(path = '/users/test', method = 'POST')
async def stamp_create_user(request: Request, response):
    response.headers['X-Route'] = 'create-user'

    return response
```

## Important Detail About path

Middleware is matched against the registered route `path_template`, not the original URL string.

For example, if the route is declared as:

```python
@REST(prefix = '/users')
class UserController:
    @get('/current/{name:str}')
    async def current_name(self, name: str):
        return { 'name': name }
```

then middleware must use the final template:

```python
@middleware.before(path = '/users/current/{name:str}', method = 'GET')
async def test(request: Request, call):
    return await call(request)
```

This is the form used in the example application.

## When to Use Route Middleware

Use route middleware when logic applies to a few lifecycle points, but not the whole application:

- permission checks for a specific handler;
- logging a sensitive operation;
- adding a header to one route;
- temporary compatibility for an old API;
- targeted error handling.

If the logic applies to every method in one controller, controller middleware is usually more convenient.
