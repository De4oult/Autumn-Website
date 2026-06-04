---
title: Dependency Graph
description: Trace container links from roots to the last leaves.
---

Autumn collects DI container information and exposes it through a built-in route:

```http
GET /documentation/dependencies.json
```

This JSON is used by `/autumn` to show services, leaf functions, configurations, and links between them.

## What the Graph Is Built From

The graph is built from type hints:

- `__init__` parameters in services;
- leaf function parameters;
- the type returned by a leaf;
- registered configurations;
- provider scope and lifecycle.

Example:

```python
@leaf
async def database(configuration: DatabaseConfiguration) -> DBClient:
    return DBClient(
        host = configuration.host,
        port = configuration.port
    )

@service
class UserService:
    def __init__(self, database: DBClient):
        self.database = database
```

Links:

```text
UserService -> DBClient
DBClient -> DatabaseConfiguration
```

`DBClient` appears in the graph as a leaf dependency because it is provided by `database`.

## What dependencies.json Contains

The response contains several main sections:

```json
{
    "app": {
        "name" : null,
        "version" : null,
        "description" : "Services documentation"
    },
    "services" : [],
    "leaf" : [],
    "configurations" : [],
    "graph" : []
}
```

`services` contains services registered with `@service`.

`leaf` contains dependencies registered with `@leaf`.

`configurations` contains configuration classes.

`graph` contains the dependency tree.

## How Autumn Detects Dependencies

Autumn only looks at parameters with type hints.

```python
@service
class UserService:
    def __init__(self, database: DBClient):
        self.database = database
```

Here, `DBClient` appears in the graph.

Without a type hint, the dependency is not visible to the container or documentation.

```python
# Avoid this
@service
class UserService:
    def __init__(self, database):
        self.database = database
```

That parameter cannot be resolved reliably through DI.

## Scope and Lifecycle

For each dependency, Autumn shows scope and lifecycle.

| Scope       | Lifecycle   |
| ----------- | ----------- |
| `app`       | `singleton` |
| `request`   | `scoped`    |
| `websocket` | `scoped`    |
| `transient` | `transient` |

This helps you see which objects live for the whole application and which are created per request.

## Cycles and Repeated Links

The graph documentation is protected from infinite traversal. If a dependency has already appeared higher in the chain, it is displayed as a reference instead of being expanded again.

```text
A -> B -> A
```

Such a graph should not break the documentation page, but the dependency cycle itself is usually worth reconsidering.

## Use During Development

The dependency graph is useful as the application grows:

- see which services depend on infrastructure;
- find overly large services;
- verify that controllers depend on services, not directly on database clients;
- inspect dependency scope;
- explain the application structure to a new developer.

## Minimal Example

```python
from autumn import Autumn, leaf, service
from autumn.controller import REST, get

app = Autumn()

class DBClient:
    def get_host(self) -> str:
        return '127.0.0.1'

@leaf
async def database() -> DBClient:
    return DBClient()

@service
class UserService:
    def __init__(self, database: DBClient):
        self.database = database

    def get_db_host(self) -> str:
        return self.database.get_host()

@REST(prefix = '/users')
class UserController:
    def __init__(self, users: UserService):
        self.users = users

    @get('/host')
    async def get_host(self):
        return { 'host': self.users.get_db_host() }
```

After startup, dependency documentation is available at:

```http
GET /documentation/dependencies.json
```

The visual graph page is available through the built-in Autumn interface.
