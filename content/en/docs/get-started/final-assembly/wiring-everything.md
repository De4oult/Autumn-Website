---
title: Wiring Everything Together
description: Combine your first controller and service into one tidy application.
---

At this point, the application already has the basic Autumn rhythm: an entry point, a controller boundary, and a service layer.

## A Small Final Snapshot
```text
app/
  controllers/
    hello.py
  services/
    greeting.py
app.py
```

## Final Result
The application now looks predictable:
controllers receive requests, services execute logic, and the structure stays readable even as the project grows.

This is a simple but stable foundation.
You can layer new capabilities on top of it gradually without losing control over the code or its structure.

From here, things grow naturally: routes become more complex, dependencies appear, configuration expands, and infrastructure joins in.
But the principle stays the same: clear boundaries, separated responsibilities, and minimal magic.
