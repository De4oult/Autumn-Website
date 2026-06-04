---
title: Dependencies
description: Lay out services, leaf functions, and configurations in a clear autumn graph.
---

Autumn can build documentation for the DI container: services, leaf dependencies, custom configurations, and links between them.

JSON is available through:

```http
GET /documentation/dependencies.json
```

The web interface is available at:

```http
GET /autumn
```

## What Goes Into the Documentation

Dependency documentation contains the main sections:

```json
{
    "app" : {},
    "services" : [],
    "leaf" : [],
    "configurations" : [],
    "graph" : []
}
```

`services` - classes registered with `@service`.

`leaf` - functions registered with `@leaf`.

`configurations` - custom configuration classes.

`graph` - the dependency tree between services and leaf functions.

## Services

A service appears in documentation if it is marked with `@service`.

```python
from autumn import service

@service
class UserService:
    """UserService - services for user management"""

    def __init__(self, database: DBClient):
        self.database = database

    def healthcheck(self) -> str:
        """return database status"""
        return self.database.healthcheck()
```

For a service, Autumn shows:

- name;
- module and qualname;
- scope;
- lifecycle;
- what the service provides;
- `__init__` signature;
- constructor dependencies;
- public methods;
- class and method docstrings.

Methods whose names start with `_` are treated as internal and are not shown as public.

## Leaves

A leaf appears in documentation if it is marked with `@leaf`.

```python
from autumn import leaf

@leaf
async def database(configuration: DatabaseConfiguration) -> DBClient:
    """db client dependency"""
    return DBClient(
        host = configuration.host,
        port = configuration.port
    )
```

For a leaf, Autumn shows:

- function name;
- return type as `provides`;
- scope and lifecycle;
- signature;
- dependencies from parameter type hints;
- docstring.

## Configurations

Custom configurations are also shown in dependency documentation.

```python
from autumn.configuration import Configuration, Maple, source

@source.json('./config.json')
class ApplicationConfiguration(Configuration):
    database_dsn: Maple['application.name', str] = 'My Progressive Web App'
```

For configuration, Autumn shows:

- class name;
- scope `app`;
- lifecycle `singleton`;
- fields;
- field types;
- `Maple` paths;
- default values.

Built-in configurations are hidden from this documentation to avoid noise in the graph. If you create a subclass of a built-in configuration, the custom class is visible.

## Graph

The graph is built from type hints.

```python
@service
class UserService:
    def __init__(self, database: DBClient):
        self.database = database

@leaf
async def database(configuration: DatabaseConfiguration) -> DBClient:
    return DBClient(
        host = configuration.host,
        port = configuration.port
    )
```

Links:

```text
UserService -> DBClient -> DatabaseConfiguration
```

Autumn protects graph generation from cycles and repeated traversals. If a type has already been seen, it is displayed as a reference.

## Scope and Lifecycle

Documentation shows scope and lifecycle for each dependency.

| Scope       | Lifecycle   |
| ----------- | ----------- |
| `app`       | `singleton` |
| `request`   | `scoped`    |
| `websocket` | `scoped`    |
| `transient` | `transient` |

This helps you see which objects live for the whole application and which are created per request or connection.

## Improving Dependency Documentation

Use type hints and docstrings.

```python
@service
class UserService:
    """Operations for users."""

    def __init__(self, database: DBClient):
        self.database = database

    def get_user(self, id: int) -> User:
        """Returns user by id"""
        raw_data: Dict[str, Any] = (
            self.database
                .select('name, email')
                .table('users')
                .eq('id', id)
        )

        return User(
            id, 
            raw_data.get('name'), 
            raw_data.get('email')
        )
```

Autumn takes dependencies from type hints and text from docstrings.
