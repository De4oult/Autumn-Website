---
title: Validation
description: Let Autumn validate request bodies and query parameters before your handler runs.
---

Autumn validates request bodies through Pydantic models and query parameters through the `query` decorators.

## Request Body Validation

Declare a Pydantic model in the handler signature.

```python
from pydantic import BaseModel, Field

from autumn.controller import REST, post

class UserSchema(BaseModel):
    name: str = Field(..., min_length = 4, max_length = 10)
    age: int = Field(..., ge = 13, le = 150)

@REST(prefix = '/users')
class UserController:
    @post('/')
    async def create_user(self, user: UserSchema):
        return user
```

Autumn:

1. reads the request body;
2. parses it as JSON;
3. validates it with Pydantic;
4. passes a `UserSchema` instance to the handler.

Only one body parameter is supported in one handler.

## Pydantic Errors

If JSON is valid but fails model validation, Autumn returns `422`.

```json
{
    "code": "VALIDATION_ERROR",
    "details": "Request validation failed",
    "fields": [
        {
            "source": "body",
            "field": "age",
            "input": 10,
            "error": "Input should be greater than or equal to 13"
        }
    ],
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```

For custom Pydantic validators, Autumn keeps the validator message clean:

```python
from pydantic import BaseModel, model_validator

class PhoneStartRequest(BaseModel):
    region: str
    phone: str

    @model_validator(mode = 'after')
    def validate_region(self):
        if len(self.region) != 2:
            raise ValueError('Region must be an ISO 3166-1 alpha-2 country code')

        return self
```

Response:

```json
{
    "code": "VALIDATION_ERROR",
    "details": "Request validation failed",
    "fields": [
        {
            "source": "body",
            "field": "body",
            "input": {
                "region": "",
                "phone": "+37377932972"
            },
            "error": "Region must be an ISO 3166-1 alpha-2 country code"
        }
    ],
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```

## Query Parameter Validation

Use `query` decorators when a handler needs typed query parameters.

```python
from autumn.controller import REST, get
from autumn.request import query

@REST(prefix = '/users')
class UserController:
    @get('/search')
    @query.string('name', required = True)
    @query.int('page', default = 1)
    async def search(self, name: str, page: int):
        return {
            'name': name,
            'page': page
        }
```

If a required query parameter is missing, Autumn returns `400` with the same validation shape:

```json
{
    "code": "VALIDATION_ERROR",
    "details": "Request validation failed",
    "fields": [
        {
            "source": "query",
            "field": "name",
            "input": null,
            "error": "Field required"
        }
    ],
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```

If casting fails, `input` contains the original query value.

## Empty Body

If the body is empty and the body parameter is required, Autumn returns `400`.

```python
@post('/users')
async def create_user(self, user: UserSchema):
    return { 'ok': True }
```

If the parameter has a default value, Autumn uses it when the body is empty.

```python
@post('/users')
async def create_user(self, user: UserSchema = UserSchema(name = 'Guest', age = 18)):
    return { 'ok': True }
```

## Invalid JSON

If the body is not valid JSON, Autumn returns `400`.

```http
POST /users
Content-Type: application/json
```

```json
{ "name": "Dima",
```

The handler is not called.

## Manual Validation

If you need custom compatibility handling, accept `Request` and read JSON manually.

```python
from autumn import Request

@post('/compatibility/check')
async def check_compatibility(self, request: Request):
    payload = await request.json()

    if 'version' not in payload:
        return { 'ok': False, 'error': 'version is required' }

    return { 'ok': True }
```

For regular DTOs and input forms, prefer Pydantic models: the request contract stays visible in the handler signature and can be used in generated documentation.
