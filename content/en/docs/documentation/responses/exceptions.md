---
title: Exceptions
description: Return HTTP errors predictably, even when something goes wrong in the garden.
---

Autumn uses `HTTPException` for HTTP errors. It can be raised from a controller, middleware, or any code called during request handling.

```python
from autumn.controller import REST, get
from autumn.response import HTTPException

@REST(prefix = '/users')
class UserController:
    @get('/teapot')
    async def get_teapot(self):
        raise HTTPException(status = 418)
```

This handler finishes the request with status `418`.

## Status, title, and details

`HTTPException` accepts `status`, `title`, and `details`.

```python
raise HTTPException(
    status  = 404,
    title   = 'User not found',
    details = 'User with this id does not exist'
)
```

If `title` is not passed, Autumn uses the standard title for known statuses. `details` defaults to an empty string.

JSON error response:

```json
{
    "status": 404,
    "title": "User not found",
    "details": "User with this id does not exist",
    "request_id": "req-01H..."
}
```

Autumn adds `request_id` when the current request has one.

## Request ID

Every HTTP response gets an `X-Request-ID` header.

Autumn uses the first available value:

- `X-Request-ID`
- `X-Correlation-ID`
- an automatically generated id

The same id is available in JSON error responses.

```http
X-Request-ID: req-123
```

```json
{
    "status": 409,
    "title": "Something",
    "details": "Conflict",
    "request_id": "req-123"
}
```

## Meta and Custom Body

Use `meta` for structured error details that should live next to the standard error shape.

```python
raise HTTPException(
    status = 409,
    details = 'Email already exists',
    meta = {
        'field': 'email',
        'code': 'duplicate'
    }
)
```

JSON response:

```json
{
    "status": 409,
    "title": "Something",
    "details": "Email already exists",
    "request_id": "req-123",
    "meta": {
        "field": "email",
        "code": "duplicate"
    }
}
```

If you need a fully custom error payload, pass `body`.

```python
raise HTTPException(
    status = 400,
    body = {
        'error': 'invalid_payload'
    }
)
```

Autumn still adds `request_id` unless the custom body already contains it.

## Response Format

Autumn can return errors as JSON or HTML.

If the client explicitly prefers HTML through `Accept`, an HTML error page is returned.

```http
Accept: text/html
```

Otherwise, the error is returned as JSON.

```http
Accept: application/json
```

## Validation Errors

Some errors are raised automatically.

If a required query parameter is missing:

```python
from autumn.request import query

@get('/search')
@query.string('name', required = True)
async def search(self, name: str):
    return { 'name' : name }
```

the request returns `400`.

If the request body fails Pydantic validation, Autumn returns `422`.

```python
from pydantic import BaseModel, Field

class UserSchema(BaseModel):
    age: int = Field(..., ge = 13)
```

```json
{
    "age": 10
}
```

This payload does not pass validation.

## Unhandled Exceptions

If regular code raises an exception during request handling, Autumn catches it and returns `500`.

```python
@get('/exception')
async def exception(self):
    return { 'answer' : 1 / 0 }
```

The client receives HTTP `500`, and the exception text is placed into `details`.

In production, Autumn returns a generic `Internal Server Error` instead of exposing internal exception details.

## Handling Through Middleware

Errors can be caught in middleware to return a custom response.

```python
from autumn import Request, middleware
from autumn.response import JSONResponse

@middleware
async def catch_exception(request: Request, call):
    try:
        return await call(request)
    except Exception:
        return JSONResponse({ 'error': True }, status = 500)
```

This is useful for changing the error format centrally or adding logging.
