---
title: How to Document
description: Label routes, models, and dependencies so the documentation rustles with useful detail.
---

Autumn builds documentation from code: routes, type hints, Pydantic models, `@serializable` classes, DI dependencies, and docstrings. The cleaner the types are, the more useful the documentation becomes.

In short examples, some imports are omitted so the documentation technique stays visible.

## Describe Controllers

A controller can be described with `@description` or a docstring.

::documentation-code
@tab description [python]
```python
from autumn.controller import REST
from autumn.documentation import description

@REST(prefix = '/users')
@description('Users management controller')
class UserController:
    ...
```

@tab docstring [python]
```python
from autumn.controller import REST

@REST(prefix = '/users')
class UserController:
    '''Users management controller'''
    ...
```
::

If `@tag` is not specified, the controller tag is built from the class name.

```python
class UserController:
    ...
```

Tag:

```text
User
```

## Use summary and description for methods

Describe a method explicitly:

```python
from autumn.documentation import summary, description

@get('/test/{name:str}')
@summary('Test with Name')
@description('Method for testing')
async def get_test_user(self, name: str) -> UserSchema:
    return UserSchema(
        name = name, 
        age  = 15
    )
```

`@summary` becomes the short operation title.

`@description` becomes the detailed description.

If decorators are missing, Autumn tries to use the docstring.

```python
@get('/{id:int}/name')
async def get_username_by_id(self, id: int) -> dict:
    """Returns name of user with id=."""
    return { 'name': self.users.get_username_by_id(id) }
```

## Group Operations with tag

`@tag` can be used on a class or a method.

```python
from autumn.documentation import tag

@REST(prefix = '/users')
@tag('Users')
class UserController:
    ...
```

```python
@post
@tag('Deprecated')
async def create_user(self, user: UserSchema):
    ...
```

Tags `deprecated` and `depr` are normalized to `Deprecated`, and the operation is marked as deprecated in OpenAPI.

## Type path and query parameters

Path parameters are described in the route template.

```python
@get('/{id:int}')
async def get_user(self, id: int):
    return { 'id' : id }
```

Query parameters are described with `query`.

```python
from autumn.request import query

@get
@query.int('page', default = 10)
async def search(self, page: int):
    return { 'page' : page }
```

This lets OpenAPI show parameters, types, required/default values.

## Use Pydantic for request body

If a handler accepts a JSON body, describe it with a Pydantic model.

```python
from pydantic import BaseModel, Field

class UserSchema(BaseModel):
    name: str = Field(..., min_length = 4, max_length = 10)
    age:  int = Field(..., ge = 13, le = 150)

@post('/users')
async def create_user(self, user: UserSchema):
    return { 'ok': True }
```

Autumn adds `requestBody` and schema to OpenAPI.

## Type Responses

Return annotations help Autumn build the response schema.

```python
@get('/users/{name:str}')
async def get_user(self, name: str) -> UserSchema:
    return UserSchema(
        name = name, 
        age  = 15
    )
```

For domain objects, use `@serializable`.

```python
from autumn.serialization import serializable, Public, Private

@serializable
class User:
    def __init__(self, name: str, password: str):
        self.name:     Public[str]  = name
        self.password: Private[str] = password
```

Public fields appear in JSON schema, private fields do not.

## Document Dependencies

Dependency documentation is built from `@service`, `@leaf`, type hints, and docstrings.

```python
@leaf
async def db(configuration: DatabaseConfiguration) -> DBClient:
    """Create database client."""
    return DBClient(
        host = configuration.host,
        port = configuration.port    
    )

@service
class UserService:
    """User business logic."""

    def __init__(self, database: DBClient):
        self.database = database
```

Always specify return annotations for leaf functions.

```python
@leaf
async def database() -> DBClient:
    return DBClient()
```

## Check the Result

After startup, these are available:

```http
GET /documentation/openapi.json
GET /documentation/dependencies.json
GET /autumn
```

`/autumn` opens the built-in interface where you can inspect the API and dependency graph.

## Practical Minimum

For good documentation, usually it is enough to:

- write type hints for parameters and responses;
- use Pydantic for input JSON bodies;
- use `@serializable` for domain responses;
- add `@summary` and `@description` to important handlers;
- add docstrings to services, leaf functions, and public service methods;
- always include return annotations on `@leaf`.
