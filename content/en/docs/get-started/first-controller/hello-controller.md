---
title: Hello Controller
description: Add a controller with a single route and a JSON response.
---

Controllers in Autumn act as the transport layer. They receive HTTP requests, delegate business logic to the appropriate services, and produce the HTTP response.

## Your First Route

```python
from autumn.controller import get
from autumn.response import JSONResponse

from app import app

@app.rest(prefix = '/hello')
class HelloController:
    @get('/')
    async def index(self) -> JSONResponse:
        return JSONResponse({
            'message': 'Hello from Autumn'
        })
```

## Key Points
- `@app.rest(...)` groups routes within a single controller and defines a shared prefix.
- `@get('/')` defines the HTTP method and path for the handler.
- `JSONResponse` serializes the `dict` to `JSON` and returns a proper HTTP response with the required headers.
