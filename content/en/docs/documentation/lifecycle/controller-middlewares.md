---
title: Controller Middleware
description: Add shared handling to every route in one controller.
---

Controller middleware is declared inside a `@REST` class and applies to all routes in that controller.

It uses the same `@middleware` decorator as global middleware. The difference is where it is declared: if the decorator is placed on a class method, Autumn marks it as controller middleware.

```python
from autumn import middleware
from autumn.controller import REST, get

@REST(prefix = '/users')
class UserController:
    @middleware
    def trace(self):
        print('before')

        response = yield
        response.headers['X-Trace'] = '1'

        print(f'after {response.status}')

    @get('/{name:str}')
    async def get_name(self, name: str):
        return { 'name' : name }
```

This middleware runs around every route handler inside `UserController`.

## Around Middleware

`@middleware` without clarification is around middleware. It must be a generator function and make exactly one `yield`.

```python
@middleware
def trace(self):
    print('before')

    response = yield

    response.headers['X-Trace'] = '1'

    print('after')
```

Code before `yield` runs before the controller method. After `yield`, middleware receives the response.

By that moment, Autumn has already normalized the handler result into `Response`, so middleware can safely change `response.headers` even if the handler returned a `dict`, Pydantic model, or `@serializable` object.

If the generator does not yield or yields more than once, Autumn raises an error.

## Controller Before Middleware

`@middleware.before` runs before the controller method.

```python
@REST(prefix = '/users')
class UserController:
    @middleware.before
    def check(self):
        print('before controller method')
```

It does not have to return a response. It is useful for actions before the handler:

- state checks;
- logging;
- preparing data;
- calling dependencies.

## Controller After Middleware

`@middleware.after` runs after the controller method and receives the response.

```python
@REST(prefix = '/users')
class UserController:
    @middleware.after
    def stamp(self, response) -> None:
        response.headers['X-Controller'] = 'users'
```

If `after` middleware returns a `Response`, Autumn replaces the original response. If it returns `None`, the current response is used.

```python
from autumn.response import JSONResponse

@middleware.after
def replace_response(self, response):
    if response.status == 204:
        return JSONResponse({ 'empty': True })
```

## Access to request and path parameters

Controller middleware can accept the same data Autumn can pass to methods: `request` and path parameters.

```python
from autumn import Request

@REST(prefix = '/users')
class UserController:
    @middleware.before
    def log_user(self, request: Request, name: str):
        print(request.path, name)

    @get('/{name:str}')
    async def get_user(self, name: str):
        return { 'name': name }
```

Autumn passes the `name` path parameter if the current route contains it.

## Dependencies in Middleware

Because controller middleware is called through the container, dependencies can be added through type hints.

```python
@REST(prefix = '/users')
class UserController:
    @middleware.before
    def log_with_service(self, users: UserService):
        ...
```

This works the same way as injection in controller methods.

## Execution Order

For a controller, the order is:

```text
around: code before yield
before middleware
controller method
after middleware
around: code after yield
```

If there are several around middleware methods, they enter in declaration order and exit in reverse order.

```python
@middleware
def first(self):
    print('first before')

    response = yield

    print('first after')

@middleware
def second(self):
    print('second before')

    response = yield

    print('second after')
```

Order:

```text
first before
second before
controller method
second after
first after
```

## When to Use Controller Middleware

Controller middleware is convenient when logic applies to every handler in one controller:

- a shared trace header;
- permission checks for a group of routes;
- logging controller actions;
- preparing context;
- shared response handling.

If logic applies to the whole application, use global `@middleware`. If it applies to one handler, use route middleware with `path` and `method`.
