---
title: Services
description: Move business logic into services so controllers stay light.
---

In Autumn, a service is a class registered in the DI container with `@service`.

```python
from autumn import service

@service
class UserService:
    """User management service"""
    def __init__(self):
        self.users = {
            1: { 'id': 1, 'name': 'Dima' },
            2: { 'id': 2, 'name': 'Alex' }
        }

    def get_user(self, id: int) -> dict | None:
        return self.users.get(id)
```

After registration, the service can be accepted in a controller, middleware, or another service.

```python
from autumn.controller import REST, get

@REST(prefix = '/users')
class UserController:
    def __init__(self, users: UserService):
        self.users = users

    @get('/{id:int}')
    async def get_user(self, id: int):
        return self.users.get_user(id)
```

Autumn sees `users: UserService`, creates `UserService`, and passes it to the controller.

## Constructor Injection

Service dependencies are described in `__init__` through type hints.

```python
@service
class UserService:
    def __init__(self, database: DBClient):
        self.database = database
```

`DBClient` must be available in the container. For example, a leaf can provide it:

```python
@leaf
async def database(configuration: DatabaseConfiguration) -> DBClient:
    return DBClient(
        host = configuration.host,
        port = configuration.port
    )
```

When creating `UserService`, Autumn first resolves `DBClient`, then calls the constructor.

## Services in Controllers

Controllers are also created through the container, so services can be passed directly to controller `__init__`.

```python
@REST(prefix = '/users')
class UserController:
    def __init__(self, users: UserService):
        self.users = users
```

This keeps controllers thin: the controller owns HTTP concerns, while the service owns business logic.

## Scope

By default, `@service` uses `Scope.APP`, so the service works as a singleton.

```python
@service
class UserService:
    ...
```

Scope can be specified explicitly:

```python
from autumn import service
from autumn.core.dependencies.scope import Scope

@service(scope = Scope.REQUEST)
class RequestUserService:
    ...
```

Available scopes:

| Scope             | Lifecycle   | Behavior                           |
| ----------------- | ----------- | ---------------------------------- |
| `Scope.APP`       | `singleton` | one object per application         |
| `Scope.REQUEST`   | `scoped`    | one object per HTTP request        |
| `Scope.WEBSOCKET` | `scoped`    | one object per WebSocket connection |
| `Scope.TRANSIENT` | `transient` | a new object on every resolution   |

## Service Methods

Service methods are regular Python methods. You can document them with docstrings; Autumn uses those in dependency documentation.

```python
@service
class UserService:
    """User management service"""
    def __init__(self):
        self.users = {
            1: { 'id': 1, 'name': 'Dima' },
            2: { 'id': 2, 'name': 'Alex' }
        }

    def get_user_name(self, id: int) -> str | None:
        """Return user name by id."""
        user = self.users.get(id)

        if user is None:
            return None

        return user['name']
```

Public methods are shown in dependency documentation. Methods whose names start with `_` are considered internal.

## Service Depends on Service

Services can be connected to each other through type hints.

```python
@service
class EmailService:
    def send(self, email: str, text: str) -> None:
        ...

@service
class UserService:
    def __init__(self, email: EmailService):
        self.email = email
```

The container builds the dependency chain automatically.

## When to Use service

`@service` fits application business logic:

- user management;
- booking workflows;
- sending notifications;
- orchestration of several leaf dependencies;
- reusable operations called from controllers.

If an object is an infrastructure client or is created by a factory function, `@leaf` is usually a better fit.
