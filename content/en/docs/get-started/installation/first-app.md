---
title: First App
description: Create the first entry point your Autumn application can grow from.
---

Your first application can be very small. The important part is that the application object becomes the single entry point for routes, configuration, and future modules.

## Minimal Setup

```python
from autumn import Autumn

import uvicorn

app = Autumn()

if __name__ == '__main__':
    uvicorn.run(app)
```

## Why Start Like This

- `Autumn(...)` defines a clear application boundary.
- The runtime stays explicit, with no hidden CLI magic.
- When controllers and services appear later, they already have a stable root.

## How Other Parts Are Connected

Controllers, services, leaf functions, and hooks must live in imported application modules or in modules Autumn discovers during startup. On the next step, we will place the controller in `app/controllers` and keep application assembly in `main.py`.
