---
title: OpenAPI
description: Show your API as a clear schema where every route is visible through the autumn fog.
---

Autumn automatically builds an OpenAPI schema for HTTP routes in controllers. The schema is available through a built-in route:

```http
GET /documentation/openapi.json
```

This JSON is used by the built-in documentation interface and can be connected to external tools that understand OpenAPI `3.0.3`.

In the examples below, some imports are omitted when a fragment focuses on one documentation feature.

## What Goes Into the Schema

Autumn walks through registered controller routes and builds `paths`.

```python
from autumn.controller import REST, get

@REST(prefix = '/users')
class UserController:
    @get('/{name:str}')
    async def get_user(self, name: str):
        return { 'name' : name }
```

This route appears in OpenAPI as:

```http
GET /users/{name}
```

Path parameters are described automatically.

## Path Parameters

Path parameter types are taken from the route template.

```python
@get('/{id:int}')
async def get_user(self, id: int):
    return { 'id': id }
```

For `id`, Autumn creates an OpenAPI parameter:

```json
{
    "name" : "id",
    "in" : "path",
    "required" : true,
    "schema" : {
        "type" : "integer"
    }
}
```

Supported types: `str`, `int`, `float`, `uuid`.

## Query Parameters

Query parameters appear in the schema if they are declared through `query`.

```python
from autumn.request import query

@get
@query.int('page', default = 10)
async def search(self, page: int):
    return { 'page' : page }
```

OpenAPI will include the `page` query parameter with an `integer` schema and default `10`.

If a query parameter is marked as `required=True`, that is included too.

## Request Body

If a method accepts a Pydantic model as a body parameter, Autumn adds `requestBody`.

```python
from pydantic import BaseModel, Field

class UserSchema(BaseModel):
    name: str = Field(..., min_length = 4)
    age: int

@post
async def create_user(self, user: UserSchema):
    return { 'ok' : True }
```

The OpenAPI schema contains a JSON body with the Pydantic schema for `UserSchema`.

## Response Schema

Autumn can build a JSON response schema from the return annotation.

```python
@get('/current/{name:str}')
async def get_test_user(self, name: str) -> UserSchema:
    return UserSchema(
        name = name, 
        age  = 15
    )
```

If the method returns a Pydantic model, `dict`, `list`, or `@serializable` type, the response is described as `application/json`.

```python
@serializable
class User:
    name: Public[str]

@get('/{name:str}')
async def get_user(self, name: str) -> User:
    return User(name)
```

## Errors in OpenAPI

Autumn adds base responses:

- `200` - successful response;
- `400` - if the method has query parameters;
- `422` - if the method has a request body;
- `500` - internal error.

If the method source contains `HTTPException(status = ...)`, that status is added to responses too.

```python
from autumn.response import HTTPException

@get('/teapot')
async def get_teapot(self):
    raise HTTPException(status = 418)
```

The schema will include response `418`.

## Tags

By default, the tag is taken from the controller name without the `Controller` suffix.

```python
@REST(prefix = '/users')
class UserController:
    ...
```

Tag:

```text
User
```

You can override the tag with `@tag`.

```python
from autumn.documentation import tag

@REST(prefix = '/users')
@tag('Users')
class UserController:
    ...
```

Methods can also have additional tags.

```python
@post('/test')
@tag('Deprecated')
async def create_user(self, user: UserSchema):
    ...
```

Tags `deprecated` and `depr` are normalized to `Deprecated`, and the operation is marked as deprecated.

## Summary and description

Use `@summary` and `@description` for manual operation descriptions.

```python
from autumn.documentation import summary, description

@get('/test_json_response/{name:str}')
@summary('Test JSON response')
@description('A really nice method')
async def get_test_user(self, name: str) -> UserSchema:
    return UserSchema(
        name = name, 
        age  = 15
    )
```

If decorators are not specified, Autumn tries to use the method docstring. If there is no docstring, summary defaults to the method name.

## Built-in Interface

OpenAPI can be viewed through the JSON endpoint:

```http
GET /documentation/openapi.json
```

And through the Autumn web interface:

```http
GET /autumn
```
