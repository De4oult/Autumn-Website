---
title: Hooks
description: Run startup and shutdown code at the right point in the application lifecycle.
---

Lifecycle hooks let you run code when the application starts and stops. Autumn uses `@startup` and `@shutdown` for this.

```python
from autumn import startup, shutdown

@startup
async def connect_to_database():
    print('Connecting Database')

@shutdown
async def disconnect_database():
    print('Disconnecting Database')
```

`@startup` runs during the ASGI `lifespan.startup` event, and `@shutdown` runs during `lifespan.shutdown`.

## Startup Hook

Startup hooks are useful for initializing resources needed before request handling begins.

```python
from autumn import startup

@startup
async def warmup_cache():
    print('Cache warmup')
```

Typical tasks:

- check database connection;
- warm up cache;
- open a connection to an external service;
- prepare background resources.

Before running startup hooks, Autumn synchronizes dependency providers, configurations, services, and controllers.

## Shutdown Hook

Shutdown hooks are used for graceful cleanup.

```python
from autumn import shutdown

@shutdown
async def close_resources():
    print('Closing resources')
```

Typical tasks:

- close connections;
- stop background tasks;
- flush buffers;
- write final logs.

## Multiple Hooks

You can declare several `@startup` and `@shutdown` hooks.

```python
@startup
async def connect_database():
    ...

@startup
async def connect_cache():
    ...
```

Autumn runs registered startup hooks through `asyncio.gather`. Shutdown hooks run the same way.

This means hooks should be independent. If one hook must run strictly after another, combine those steps into one function.

```python
@startup
async def initialize_in_order():
    await connect_database()
    await run_migrations()
    await warmup_cache()
```

## Hook Errors

If a startup hook fails, the application sends `lifespan.startup.failed` and startup is interrupted.

If a shutdown hook fails, the application sends `lifespan.shutdown.failed`.

```python
@startup
async def connect_database():
    raise RuntimeError('Database is unavailable')
```

This hook prevents the application from starting normally.

## Where to Declare Hooks

Hooks can be declared near the application or in modules Autumn discovers during startup.

```python
from autumn import Autumn, startup

app = Autumn()

@startup
async def on_startup():
    print('Application started')
```

For small applications, keeping hooks in the main file is convenient. For larger applications, move them to a lifecycle module.
