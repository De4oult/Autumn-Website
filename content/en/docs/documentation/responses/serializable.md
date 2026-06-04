---
title: @serializable
description: Turn domain objects into JSON while keeping private fields under fallen leaves.
---

`@serializable` lets controllers return regular Python objects as JSON. It is useful when you do not want to create a Pydantic DTO, but still want explicit control over public and private fields.

```python
from autumn.serialization import serializable, Public, Private

@serializable
class User:
    def __init__(self, name, age, password):
        self.id:   Public[int] = 1
        self.name: Public[str] = name
        self.age:  Public[int] = age

        self.password: Private[str] = password
```

Return it directly from a handler:

```python
from autumn.controller import REST, get

@REST(prefix = '/users')
class UserController:
    @get('/{name:str}')
    async def get_user(self, name: str):
        return User(name, 18, 'qwerty123!')
```

Response:

```json
{
    "id": 1,
    "name": "dima",
    "age": 18
}
```

`password` is excluded because it is marked as `Private`.

## Public and Private

`Public` and `Private` are used as type annotations.

```python
self.name:     Public[str]  = name
self.password: Private[str] = password
```

`Public` means the field can be serialized to JSON.

`Private` means the field should be excluded from JSON.

If a field is not marked as either `Public` or `Private`, but exists in `vars(object)` and does not start with `_`, Autumn also includes it in JSON.

```python
@serializable
class Product:
    def __init__(self, title: str):
        self.title = title
```

```json
{
    "title": "Book"
}
```

## Annotations in __init__

Autumn can find fields annotated inside `__init__`.

```python
@serializable
class User:
    def __init__(self, name: str):
        self.name:  Public[str]  = name
        self.token: Private[str] = 'secret'
```

This is convenient for classes where fields are created during initialization.

## Class-Level Annotations

Fields can also be described at class level.

```python
@serializable
class User:
    id:       Public[int]
    name:     Public[str]
    password: Private[str]

    def __init__(self, name: str, password: str):
        self.id       = 1
        self.name     = name
        self.password = password
```

The result is the same: `id` and `name` appear in JSON, `password` is hidden.

## Lists and Nested Structures

`@serializable` objects can be returned not only directly, but also inside lists and dictionaries.

```python
@get
async def list_users(self):
    return {
        'items': [
            User('Dima', 18, 'secret'),
            User('Alex', 20, 'secret')
        ]
    }
```

Autumn passes such objects to `JSONResponse`, and the serializer converts them to JSON-compatible dictionaries.

## Difference from Pydantic

Pydantic models are better for input data and strict validation.

```python
from pydantic import BaseModel, Field

class UserSchema(BaseModel):
    name: str = Field(..., min_length = 4)
    age: int
```

`@serializable` is better for output domain objects when you only need simple visibility control.

```python
@serializable
class User:
    def __init__(self, name, password):
        self.name:     Public[str]  = name
        self.password: Private[str] = password
```

Both can be returned from controllers: Autumn automatically serializes Pydantic models and `@serializable` objects.
