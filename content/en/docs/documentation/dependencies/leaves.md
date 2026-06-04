---
title: Leaves
description: Connect low-level dependencies as leaves on the DI container branches.
---

A leaf is a dependency provider function. It creates an object and tells Autumn which type it provides through its return annotation.

```python
from autumn import leaf

class DBClient:
    def __init__(self, host: str, port: int):
        self.host = host
        self.port = port

    def get_host(self) -> str:
        return self.host

@leaf
async def database(configuration: DatabaseConfiguration) -> DBClient:
    """Database client dependency"""
    return DBClient(
        host = configuration.host,
        port = configuration.port
    )
```

Here, the `database` leaf provides a `DBClient` dependency. After registration, any service, controller, or other leaf can request `DBClient` in its signature.

## Return Annotation Is Required

Autumn registers a leaf by the type declared in its return annotation.

```python
@leaf
async def database() -> DBClient:
    return DBClient(...)
```

Without a return annotation, Autumn cannot know which type the function provides and raises a DI error.

```python
# This is not allowed
@leaf
async def database():
    return DBClient(...)
```

## Leaf Dependencies

A leaf can accept dependencies itself. Autumn reads parameter type hints and provides matching objects from the container.

```python
@leaf
async def database(configuration: DatabaseConfiguration) -> DBClient:
    return DBClient(
        host = configuration.host, 
        port = configuration.port
    )
```

Here, `DatabaseConfiguration` is created and passed automatically if it is registered in the application.

A leaf can depend on another leaf:

```python
class CacheClient:
    ...

class Repository:
    def __init__(self, database: DBClient, cache: CacheClient):
        self.database = database
        self.cache = cache

@leaf
async def cache() -> CacheClient:
    return CacheClient()

@leaf
async def repository(database: DBClient, cache: CacheClient) -> Repository:
    return Repository(database, cache)
```

## Scope

By default, a leaf has `Scope.APP`. This means the result is created once and reused as a singleton.

```python
from autumn import leaf

@leaf
async def database() -> DBClient:
    return DBClient(...)
```

You can specify scope explicitly:

```python
from autumn import leaf
from autumn.core.dependencies.scope import Scope

@leaf(scope = Scope.REQUEST)
async def request_state() -> RequestState:
    return RequestState()
```

Available scopes:

| Scope             | Lifecycle   | Behavior                           |
| ----------------- | ----------- | ---------------------------------- |
| `Scope.APP`       | `singleton` | one object per application         |
| `Scope.REQUEST`   | `scoped`    | one object per HTTP request        |
| `Scope.WEBSOCKET` | `scoped`    | one object per WebSocket connection |
| `Scope.TRANSIENT` | `transient` | a new object on every resolution   |

## Sync and Async Leaves

A leaf can be a regular function or an `async` function.

```python
@leaf
def settings() -> Settings:
    return Settings()

@leaf
async def database() -> DBClient:
    return DBClient(...)
```

If the function returns an awaitable, Autumn waits for the result.

## When to Use leaf

Leaf functions fit objects that are awkward or impossible to create as regular service classes:

- database clients;
- external API clients;
- repositories assembled from several dependencies;
- infrastructure adapters;
- objects that need configuration during creation.

For business logic, `@service` is usually more convenient, while leaves are better kept for low-level dependencies.
