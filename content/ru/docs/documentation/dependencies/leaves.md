---
title: Листья
description: Подключайте низкоуровневые зависимости как листья на ветках DI-контейнера.
---

Leaf - это функция-поставщик зависимости. Она создает объект и сообщает Autumn, какой тип она предоставляет, через аннотацию возвращаемого значения.

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

В этом примере leaf `database` предоставляет зависимость типа `DBClient`. После регистрации любой сервис, контроллер или другой leaf может попросить `DBClient` в своей сигнатуре.

## Return annotation обязателен

Autumn регистрирует leaf по типу, который указан в return annotation.

```python
@leaf
async def database() -> DBClient:
    return DBClient(...)
```

Если аннотации возвращаемого значения нет, Autumn не сможет понять, какой тип предоставляет функция, и выбросит ошибку DI.

```python
# Так нельзя
@leaf
async def database():
    return DBClient(...)
```

## Зависимости leaf-функции

Leaf сам может принимать зависимости. Autumn смотрит на type hints параметров и подставляет подходящие объекты из контейнера.

```python
@leaf
async def database(configuration: DatabaseConfiguration) -> DBClient:
    return DBClient(
        host = configuration.host, 
        port = configuration.port
    )
```

Здесь `DatabaseConfiguration` будет создана и передана автоматически, если она зарегистрирована в приложении.

Leaf может зависеть и от другой leaf-функции:

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

По умолчанию leaf имеет scope `Scope.APP`. Это значит, что результат создается один раз и переиспользуется как singleton.

```python
from autumn import leaf

@leaf
async def database() -> DBClient:
    return DBClient(...)
```

Можно указать scope явно:

```python
from autumn import leaf
from autumn.core.dependencies.scope import Scope

@leaf(scope = Scope.REQUEST)
async def request_state() -> RequestState:
    return RequestState()
```

Доступные scope'ы:
| Scope             | Lifecycle   | Поведение                           |
| ----------------- | ----------- | ----------------------------------- |
| `Scope.APP`       | `singleton` | один объект на приложение           |
| `Scope.REQUEST`   | `scoped`    | один объект на HTTP-запрос          |
| `Scope.WEBSOCKET` | `scoped`    | один объект на WebSocket-соединение |
| `Scope.TRANSIENT` | `transient` | новый объект при каждом разрешении  |

## Синхронные и асинхронные leaf-функции

Leaf может быть обычной функцией или `async`-функцией.

```python
@leaf
def settings() -> Settings:
    return Settings()

@leaf
async def database() -> DBClient:
    return DBClient(...)
```

Если функция возвращает awaitable, Autumn дождется результата.

## Когда использовать leaf

Leaf хорошо подходит для объектов, которые нельзя или неудобно создавать как обычный сервис-класс:
- клиенты базы данных;
- клиенты внешних API;
- репозитории, собираемые из нескольких зависимостей;
- адаптеры инфраструктуры;
- объекты, которым нужна конфигурация при создании.

Для бизнес-логики чаще удобнее использовать `@service`, а leaf оставить для низкоуровневых зависимостей.
