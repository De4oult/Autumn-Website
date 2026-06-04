---
title: Minimal Service
description: Move logic out of the controller so the code does not thicken like autumn fog.
---

When a controller starts doing more than receiving a request and returning a response, the code quickly becomes harder to scale and maintain.
That is why business logic is better moved into services. This keeps the HTTP layer thin and also makes testing and code reuse much easier.

## A Small Service
```python
from autumn import service

@service
class GreetingService:
    def build_message(self, name: str) -> str:
        return f'Hello from service, {name}'
```

## A Simple Rule
- `Controllers` deal with HTTP: they receive requests and shape responses.
- `Services` describe business actions, orchestration, and application logic.
