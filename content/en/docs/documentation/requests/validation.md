---
title: Request Validation
description: Validate incoming data before it enters the autumn garden of your application.
---

Autumn uses Pydantic to validate JSON bodies. If a controller method parameter is annotated with a `BaseModel`, the framework reads the request body, parses JSON, and passes a validated object into the method.

```python
from pydantic import BaseModel, Field
from autumn.controller import REST, post

class UserSchema(BaseModel):
    name: str = Field(..., min_length = 2, max_length = 10)
    age:  int = Field(..., ge = 13, le = 150)

@REST(prefix = '/users')
class UserController:
    @post
    async def create_user(self, user: UserSchema):
        print(user.age)

        ...
```

The client must send JSON:

```http
POST /users
Content-Type: application/json
```

```json
{
    "name": "Dima",
    "age": 18
}
```

## Validation Rules

Constraints are described in the Pydantic model.

```python
from pydantic import BaseModel, Field

class UserSchema(BaseModel):
    name: str = Field(..., min_length = 4, max_length = 10)
    age:  int = Field(..., ge = 13, le = 150)

    is_male: bool = True
```

In this example:

- `name` is required, at least 4 characters, at most 10;
- `age` is required, from 13 to 150;
- `is_male` is optional and defaults to `True`.

## What Happens Internally

When Autumn sees a Pydantic model in the method signature, it treats that parameter as the request body.

```python
@post('/test')
async def create_user(self, user: UserSchema):
    self.user_service.create(user.name, user.age)
```

The framework:

1. reads the body;
2. parses it as JSON;
3. validates it through Pydantic;
4. passes a `UserSchema` object into the method.

Only one body parameter is supported in one handler.

## Empty Request Body

If the body is empty and the body parameter is required, Autumn returns `400`.

```python
@post('/users')
async def create_user(self, user: UserSchema):
    return { 'ok': True }
```

Request without body:

```http
POST /users
```

fails because `user` cannot be built without a JSON body.

If the parameter has a default value, it is used when the body is empty.

```python
@post('/users')
async def create_user(self, user: UserSchema = UserSchema(name = 'Guest', age = 18)):
    return { 'ok' : True }
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

This body cannot be parsed, so the handler will not be called.

## Pydantic Validation Errors

If JSON is valid but fails the model rules, Autumn returns `422`.

```json
{
    "name": "Al",
    "age": 10
}
```

For:

```python
class UserSchema(BaseModel):
    name: str = Field(..., min_length = 4, max_length = 10)
    age:  int = Field(..., ge = 13, le = 150)
```

the payload is invalid: `name` is too short and `age` is below the allowed value.

## Manual Validation

For custom handling, accept `Request` and read JSON manually.

```python
from autumn import Request

@post('/compatibility/check')
async def check_compatibility(self, request: Request):
    payload = await request.json()

    if 'version' not in payload:
        return { 'ok' : False, 'error': 'version is required' }

    return { 'ok': True }
```

For regular DTOs and input forms, Pydantic models are usually better: the request contract remains visible in the method signature and can be included in documentation.
