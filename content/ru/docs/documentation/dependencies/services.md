---
title: Сервисы
description: Вынесите бизнес-логику в сервисы, чтобы контроллеры оставались легкими.
---

Сервис в Autumn - это класс, зарегистрированный в DI-контейнере через декоратор `@service`.

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

После регистрации сервис можно принимать в контроллере, middleware или другом сервисе.

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

Autumn увидит аргумент `users: UserService`, создаст `UserService` и передаст его в контроллер.

## Constructor injection

Зависимости сервиса описываются в `__init__` через type hints.

```python
@service
class UserService:
    def __init__(self, database: DBClient):
        self.database = database
```

Тип `DBClient` должен быть доступен контейнеру. Например, его может предоставлять leaf:

```python
@leaf
async def database(configuration: DatabaseConfiguration) -> DBClient:
    return DBClient(
        host = configuration.host,
        port = configuration.port
    )
```

При создании `UserService` Autumn сначала разрешит `DBClient`, а затем вызовет конструктор.

## Сервисы в контроллерах

Контроллеры тоже создаются через контейнер. Поэтому сервисы удобно передавать прямо в `__init__` контроллера.

```python
@REST(prefix = '/users')
class UserController:
    def __init__(self, users: UserService):
        self.users = users
```

Это помогает держать контроллеры тонкими: контроллер отвечает за HTTP-слой, а сервис - за бизнес-логику.

## Scope

По умолчанию `@service` использует `Scope.APP`, то есть сервис работает как singleton.

```python
@service
class UserService:
    ...
```

Scope можно указать явно:

```python
from autumn import service
from autumn.core.dependencies.scope import Scope

@service(scope = Scope.REQUEST)
class RequestUserService:
    ...
```

Доступные scope'ы:
| Scope             | Lifecycle   | Поведение                           |
| ----------------- | ----------- | ----------------------------------- |
| `Scope.APP`       | `singleton` | один объект на приложение           |
| `Scope.REQUEST`   | `scoped`    | один объект на HTTP-запрос          |
| `Scope.WEBSOCKET` | `scoped`    | один объект на WebSocket-соединение |
| `Scope.TRANSIENT` | `transient` | новый объект при каждом разрешении  |

## Методы сервиса

Методы сервиса - обычные методы Python-класса. Их можно документировать docstring'ами: Autumn использует их в документации зависимостей.

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

Публичные методы отображаются в dependency-документации. Методы, имя которых начинается с `_`, считаются внутренними.

## Сервис зависит от сервиса

Сервисы можно связывать друг с другом через type hints.

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

Контейнер построит цепочку зависимостей автоматически.

## Когда использовать service

`@service` хорошо подходит для бизнес-логики приложения:
- управление пользователями;
- работа с бронированиями;
- отправка уведомлений;
- оркестрация нескольких leaf-зависимостей;
- повторно используемые операции, которые вызываются из контроллеров.

Если объект является инфраструктурным клиентом или создается фабричной функцией, обычно лучше использовать `@leaf`.
