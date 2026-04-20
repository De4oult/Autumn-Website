---
title: Service Injection
description: Inject a service into a controller instead of assembling objects by hand.
---

Autumn uses explicit constructor-based dependency declarations.  
If a controller needs a service, just add it to `__init__` and the container will provide the required instance automatically.

## Controller + Service


::documentation-code
@tab controller/hello.py [python]

```python
from autumn.controller import get
from autumn.response import JSONResponse

from app import app

@app.rest(prefix = '/hello')
class HelloController:
    def __init__(self, service: GreetingService):
        self.service = service

    @get('/')
    async def index(self) -> JSONResponse:
        return JSONResponse({
            'message' : self.service.build_message()
        })
```

@tab services/greeting.py [python]

```python
from app import app

@app.service
class GreetingService:
    def build_message(self) -> str:
        return 'Hello from the service layer'
```
::

## What This Gives You
- Dependencies are declared explicitly in the constructor.
- The controller is not responsible for creating services.
- The DI container manages the object lifecycle.

This is the Autumn approach: dependencies stay explicit while component wiring happens automatically.
