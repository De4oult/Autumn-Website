---
title: Exceptions
description: Return predictable HTTP errors and keep unexpected failures visible in the console.
---

Autumn uses `HTTPException` for expected HTTP errors. It can be raised from a controller, middleware, service, or any code called during request handling.

```python
from autumn.controller import REST, get
from autumn.response import HTTPException

@REST(prefix = '/users')
class UserController:
    @get('/{id:int}')
    async def get_user(self, id: int):
        raise HTTPException(
            status = 404,
            code = 'USER_NOT_FOUND',
            details = 'User with this id does not exist'
        )
```

## Error Shape

JSON errors use one stable shape:

```json
{
    "code": "USER_NOT_FOUND",
    "details": "User with this id does not exist",
    "request_id": "req-01H...",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```

`code` is the machine-readable error code. If you do not pass it, Autumn uses the HTTP status phrase:

| Status | Default code |
| ------ | ------------ |
| `400`  | `BAD_REQUEST` |
| `404`  | `NOT_FOUND` |
| `405`  | `METHOD_NOT_ALLOWED` |
| `422`  | `UNPROCESSABLE_ENTITY` |
| `500`  | `INTERNAL_SERVER_ERROR` |

Use a custom code for domain errors:

```python
raise HTTPException(
    status = 400,
    code = 'INVALID_OR_EXPIRED_CHALLENGE',
    details = 'Challenge is invalid or expired'
)
```

Response:

```json
{
    "code": "INVALID_OR_EXPIRED_CHALLENGE",
    "details": "Challenge is invalid or expired",
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```

## Validation Fields

Validation errors include `fields`.

```json
{
    "code": "VALIDATION_ERROR",
    "details": "Request validation failed",
    "fields": [
        {
            "source": "body",
            "field": "region",
            "input": "",
            "error": "Region must be an ISO 3166-1 alpha-2 country code"
        }
    ],
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```

`source` shows where the invalid value came from:

- `body` for Pydantic request body validation;
- `query` for parameters declared with `@query.string`, `@query.int`, `@query.float`, or `@query.uuid`.

Nested fields are rendered with dot notation, for example `device.id`.

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
    "code": "CONFLICT",
    "details": "Email already exists",
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```

## Meta and Custom Body

Use `meta` when you need extra structured information next to the standard error shape.

```python
raise HTTPException(
    status = 409,
    code = 'EMAIL_ALREADY_EXISTS',
    details = 'Email already exists',
    meta = {
        'field': 'email'
    }
)
```

JSON response:

```json
{
    "code": "EMAIL_ALREADY_EXISTS",
    "details": "Email already exists",
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00",
    "meta": {
        "field": "email"
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

## HTML or JSON

Autumn can return errors as JSON or HTML.

If the client explicitly prefers HTML through `Accept`, an HTML error page is returned. API clients normally receive JSON.

```http
Accept: text/html
```

## Method Not Allowed

If a route path exists but the HTTP method does not match, Autumn returns `405 Method Not Allowed` instead of `404`.

```python
@REST(prefix = '/test')
class TestController:
    @get('/')
    async def index(self):
        return { 'ok': True }
```

`POST /test` returns:

```json
{
    "code": "METHOD_NOT_ALLOWED",
    "details": "Method POST is not allowed for /test",
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```

The response also includes an `Allow` header with the available methods.

## Console Tracebacks

`HTTPException` is expected application flow and is not printed to the console.

Unhandled exceptions are internal failures. Autumn prints their full traceback to the console and returns a `500` response. In production, response details stay generic:

```json
{
    "code": "INTERNAL_SERVER_ERROR",
    "details": "Internal Server Error",
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```
