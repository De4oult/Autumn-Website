---
title: Request Body
description: Read the request body clearly and pass data into the handler.
---

In Autumn, request data can be read in two main ways: through controller method arguments or through the `Request` object.

Method arguments are convenient when a parameter is part of the public route contract. `Request` is useful when you need direct access to the raw HTTP request.

## Request in a Controller Method

To receive the request object, add a `request: Request` argument.

```python
from autumn import Request
from autumn.controller import REST, get

@REST(prefix = '/users')
class UserController:
    @get('/current/{name:str}')
    async def current_name(self, request: Request, name: str):
        return {
            'meta' : {
                'status' : 200,
                'method' : request.method,
                'path'   : request.path
            },
            'data' : {
                'name' : name
            }
        }
```

`Request` contains basic request information:

```python
request.method
request.path
request.headers
request.query
```

## Request Body

For manual body handling, use `request.body()` and `request.json()`.

```python
from autumn import Request
from autumn.controller import REST, post

@REST(prefix = '/users')
class UserController:
    @post('/raw')
    async def raw_create(self, request: Request):
        payload = await request.json()
        return { 
            'payload' : payload 
        }
```

`request.body()` returns raw body bytes, while `request.json()` parses the body as JSON.

```python
raw     = await request.body()
payload = await request.json()
```

If a method parameter is annotated with a Pydantic model, Autumn reads the JSON body, validates it, and passes the ready object into the method.

```python
from pydantic import BaseModel

class UserSchema(BaseModel):
    name: str
    age:  int

@REST(prefix = '/users')
class UserController:
    @post
    async def create_user(self, user: UserSchema):
        return { 
            'user': user.model_dump(mode = 'json') 
        }
```

This is usually more convenient than manual `request.json()` when the request has an expected structure.
