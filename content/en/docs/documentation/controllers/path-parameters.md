---
title: Path Parameters
description: Read values directly from the path, like markers on an autumn trail.
---

Path parameters let you read values directly from the URL. In Autumn, they are declared inside the route template with curly braces:

```python
from autumn.controller import REST, get

@REST(prefix = '/users')
class UserController:
    @get('/{name:str}')
    async def get_user(self, name: str):
        return { 'name' : name }
```

Route:

```http
GET /users/dima
```

The method receives:

```python
name == 'dima'
```

The parameter name in the path must match the method argument name.

## Path Parameter Types

Parameter syntax:

```text
{name:type}
```

If the type is omitted, `str` is used.

| Type    | Python type | What it accepts              |
| ------- | ----------- | ---------------------------- |
| `str`   | `str`       | one path segment without `/` |
| `int`   | `int`       | an integer                   |
| `float` | `float`     | a decimal number             |
| `uuid`  | `UUID`      | a UUID string                |
| `path`  | `str`       | the rest of the path, including `/` |

Example with a numeric identifier:

```python
@REST(prefix = '/users')
class UserController:
    @get('/{id:int}')
    async def get_user(self, id: int):
        return { 'id' : id }
```

```http
GET /users/42
```

Inside the method, `id` is already an `int`, not a string.

## Multiple Parameters

Parameters can be combined with regular path segments.

```python
@REST(prefix = '/users')
class UserController:
    @get('/{user_id:int}/posts/{post_id:int}')
    async def get_post(self, user_id: int, post_id: int):
        return {
            'user_id': user_id,
            'post_id': post_id
        }
```

```http
GET /users/10/posts/25
```

## Rest-of-Path Parameter

The `path` type is useful when a parameter should capture more than one segment.

```python
@REST(prefix = '/users')
class UserController:
    @get('/files/{file:path}')
    async def fs_file(self, file: str):
        return { 'file' : file }
```

```http
GET /users/files/images/avatar.png
```

The method receives:

```python
file == 'images/avatar.png'
```

Important: a `path` parameter must be the last segment of the route.

```python
# This is not allowed
@get('/files/{file:path}/meta')
async def broken(self, file: str):
    ...
```

## When the Value Does Not Match

If the URL does not match the parameter type, the route is not considered a match.

```python
@get('/{id:int}')
async def get_user(self, id: int):
    ...
```

This route matches `/users/123`, but not `/users/alex`.
