---
title: Service Injection
description: Pass a service into a controller through DI and leave manual assembly outside.
---

Autumn uses explicit constructor-based dependency declarations.  
If a controller needs a service, just add it to `__init__` and the container will provide the required instance automatically.

## Controller + Service

::documentation-code
@tab controller/hello.py [python]

```python
from autumn.controller import REST, get
from autumn.response import JSONResponse

from app.services.greeting import GreetingService

@REST(prefix = '/hello')
class HelloController:
    def __init__(self, service: GreetingService) -> None:
        self.service = service
    
    @get('/{name:str}')
    async def hello_by_name(self, name: str) -> JSONResponse:
        return JSONResponse({
            'message' : self.service.build_message(name)
        })
```

@tab services/greeting.py [python]

```python
from autumn import service

@service
class GreetingService:
    def build_message(self, name: str) -> str:
        return f'Hello from service, {name}'
```
::

## What This Gives You
- Dependencies are declared explicitly in the constructor.
- The controller is not responsible for creating services.
- The DI container manages the object lifecycle.

This is the Autumn approach: dependencies stay explicit while component wiring happens automatically.
