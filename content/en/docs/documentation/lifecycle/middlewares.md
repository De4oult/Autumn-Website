---
title: Middleware
description: Wrap HTTP requests with shared logic before and after the handler.
---

Middleware lets you run code around HTTP request handling. In Autumn, middleware is declared with one `@middleware` decorator.

The same decorator is used in two places:

- at module level, it registers global or route middleware;
- inside a `@REST` class, it marks a method as controller middleware.

```python
from autumn import Request, middleware

@middleware
async def log_request(request: Request, call):
    print('>> Request received: ', request.method, request.path)

    return await call(request)
```

Module-level middleware receives `request` and `call`. To pass the request further, call:

```python
return await call(request)
```

Controller middleware has a different shape: it is declared inside a class and can use `yield`, `request`, path parameters, and controller dependencies.

## Around Middleware

`@middleware` and `@middleware.before()` wrap the route handler.

```python
@middleware
async def log_request(request: Request, call):
    print(request.method, request.path)

    response = await call(request)

    return response
```

In this middleware you can:

- log the request;
- check authorization;
- modify `request`;
- stop handling early and return a response;
- wrap the handler in `try/except`.

Early response example:

```python
from autumn.response import JSONResponse

@middleware.before()
async def require_token(request: Request, call):
    if request.header('authorization') is None:
        return JSONResponse({ 'error': 'Unauthorized' }, status = 401)

    return await call(request)
```

## After Middleware

`@middleware.after()` runs after the route handler. It receives `request` and the ready `response`, so it does not call the handler.

```python
from autumn import middleware

@middleware.after()
async def log_response(request: Request, response):
    print('<< Response sent:', response.status)

    return response
```

It is convenient for changing response headers:

```python
@middleware.after()
async def add_header(request: Request, response):
    response.headers['X-App'] = 'autumn'

    return response
```

## Execution Order

If several `@middleware` or `@middleware.before()` functions are registered, they wrap the handler in registration order.

```python
@middleware
async def first(request, call):
    print('first before')

    response = await call(request)

    print('first after')

    return response

@middleware
async def second(request, call):
    print('second before')

    response = await call(request)

    print('second after')

    return response
```

The logic looks like:

```text
first before
second before
handler
second after
first after
```

`@middleware.after()` functions run after this chain in registration order.

## Exception Handling

`@middleware` can be used as a centralized error handler.

```python
from autumn.response import JSONResponse

@middleware
async def catch_exception(request: Request, call):
    try:
        return await call(request)

    except Exception:
        return JSONResponse({ 'error': True }, status = 500)
```

This middleware catches exceptions raised below it in the chain.

## Global Middleware

If `path` and `method` are not specified, middleware applies to all HTTP routes.

```python
@middleware
async def global_logger(request: Request, call):
    print(request.method, request.path)

    return await call(request)
```

To handle only specific routes, use route middleware with `path` and `method`.
