---
title: Hello Controller
description: Add your first controller and return a small JSON greeting from Autumn.
---

Controllers in Autumn act as the transport layer. They receive HTTP requests, delegate business logic to the appropriate services, and produce the HTTP response.

## Your First Route

```python
from autumn.controller import REST, get
from autumn.response import JSONResponse

@REST(prefix = '/hello')
class HelloController:
    @get
    async def index(self) -> JSONResponse:
        return JSONResponse({
            'message': 'Hello from Autumn'
        })
```

## Key Points
- `@REST(...)` groups routes within a single controller and defines a shared prefix.
- `@get` defines the HTTP method and path for the handler.
- `JSONResponse` serializes the `dict` to `JSON` and returns a proper HTTP response with the required headers.
- The controller module must be imported by the application or discovered by Autumn during startup.
