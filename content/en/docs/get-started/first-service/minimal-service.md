---
title: Minimal Service
description: Move reusable application logic into a dedicated service class.
---

When a controller starts doing more than receiving a request and returning a response, the code quickly becomes harder to scale and maintain.
That is why business logic is better moved into services. This keeps the HTTP layer thin and also makes testing and code reuse much easier.

## A Small Service
```python
from app import app

@app.service
class GreetingService:
    def build_message(self) -> str:
        return 'Hello from the service layer'
```

## A Simple Rule
- `Controllers` deal with HTTP: they receive requests and shape responses.
- `Services` describe business actions, orchestration, and application logic.
