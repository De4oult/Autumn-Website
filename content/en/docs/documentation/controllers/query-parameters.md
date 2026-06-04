---
title: Query Parameters
description: Gather URL values neatly, like autumn leaves in a basket.
---

Query parameters are passed after `?` in the URL:

```http
GET /users?page=2
```

In Autumn, you can read them through `request.query` or declare them explicitly with `query` decorators.

## Reading Through Request

The simplest way is to accept `Request` and use `request.query`.

```python
from autumn import Request
from autumn.controller import REST, get

@REST(prefix = '/users')
class UserController:
    @get
    async def search(self, request: Request):
        return {
            'page' : request.query.page
        }
```

For:

```http
GET /users?page=2
```

the value is available as:

```python
request.query.page == '2'
```

Values read this way remain strings because they come from the URL.

## Typed Query Parameters

To let Autumn extract and cast a query parameter, use `query` from `autumn.request`.

```python
from autumn.request import query
from autumn.controller import REST, get
from autumn.response import JSONResponse

@REST(prefix = '/users')
class UserController:
    @get
    @query.int('page', default = 1)
    async def search(self, page: int):
        return JSONResponse({ 'page' : page })
```

`GET /users?page=3` passes:

```python
page == 3
```

If the parameter is missing, the default is used:

```python
page == 1
```

## Supported Types

Available decorators:

```python
query.string()
query.int()
query.float()
query.uuid()
```

Example:

```python
@REST(prefix = '/products')
class ProductController:
    @get
    @query.string('search')
    @query.float('min_price')
    async def list_products(self, search: str, min_price: float):
        return {
            'search'    : search,
            'min_price' : min_price
        }
```

```http
GET /products?search=phone&min_price=199.99
```

## Required Parameters

By default, a query parameter is optional. If it is missing and has no `default`, the method receives `None`.

Use `required = True` to make it required.

```python
@REST(prefix = '/users')
class UserController:
    @get('/search')
    @query.string('name', required = True)
    async def search_by_name(self, name: str):
        return { 'name' : name }
```

Calling the route without `name`:

```http
GET /users/search
```

returns `400` with a message about the missing query parameter.

## Default and Required

A parameter cannot be required and have a default at the same time.

```python
# This is not allowed
@query.int('page', required = True, default = 1)
```

If a default exists, the parameter can already be omitted from the URL.

## Type Casting Errors

If the value cannot be cast to the declared type, Autumn returns `400`.

```python
@get
@query.int('page')
async def search(self, page: int):
    return { 'page': page }
```

Valid:

```http
GET /users?page=5
```

Invalid:

```http
GET /users?page=abc
```
