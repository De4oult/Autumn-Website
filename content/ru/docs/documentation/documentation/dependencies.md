---
title: Зависимости
description: Разложите сервисы, leaf-функции и конфигурации в прозрачный осенний граф.
---

Autumn умеет строить документацию по DI-контейнеру: сервисам, leaf-зависимостям, пользовательским конфигурациям и связям между ними.

JSON доступен по встроенному маршруту:

```http
GET /documentation/dependencies.json
```

Веб-интерфейс доступен через:

```http
GET /autumn
```

## Что попадает в документацию

Dependencies-документация содержит основные секции:

```json
{
    "app" : {},
    "services" : [],
    "leaf" : [],
    "configurations" : [],
    "graph" : []
}
```

`services` - классы, зарегистрированные через `@service`.

`leaf` - функции, зарегистрированные через `@leaf`.

`configurations` - пользовательские классы конфигурации.

`graph` - дерево зависимостей между сервисами и leaf-функциями.

## Сервисы

Сервис попадает в документацию, если помечен декоратором `@service`.

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

Для сервиса Autumn показывает:
- имя;
- module и qualname;
- scope;
- lifecycle;
- что предоставляет сервис;
- подпись `__init__`;
- зависимости конструктора;
- публичные методы;
- docstring класса и методов.

Методы, имя которых начинается с `_`, считаются внутренними и не выводятся как публичные.

## Leaf'ы

Leaf попадает в документацию, если помечен `@leaf`.

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

Для leaf-функции Autumn показывает:
- имя функции;
- return type как `provides`;
- scope и lifecycle;
- signature;
- зависимости по type hints параметров;
- docstring.

## Конфигурации

Пользовательские конфигурации тоже отображаются в dependencies-документации.

```python
from autumn.configuration import Configuration, Maple, source

@source.json('./config.json')
class ApplicationConfiguration(Configuration):
    database_dsn: Maple['application.name', str] = 'My Progressive Web App'
```

Для конфигурации Autumn показывает:
- имя класса;
- scope `app`;
- lifecycle `singleton`;
- поля;
- типы полей;
- пути `Maple`;
- default-значения.

Встроенные конфигурации скрываются из этой документации, чтобы не шуметь в графе. Если ты создаешь наследника встроенной конфигурации, пользовательский класс будет виден.

## Graph

Граф строится из type hints.

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

Связи будут выглядеть так:

```text
UserService -> DBClient -> DatabaseConfiguration
```

Autumn защищает генерацию графа от циклов и повторных обходов. Если тип уже был встречен, он отображается как ссылка.

## Scope и lifecycle

Документация показывает scope и lifecycle каждой зависимости.

| Scope       | Lifecycle   |
| ----------- | ----------- |
| `app`       | `singleton` |
| `request`   | `scoped`    |
| `websocket` | `scoped`    |
| `transient` | `transient` |

Это помогает быстро увидеть, какие объекты живут все время работы приложения, а какие создаются на запрос или соединение.

## Как улучшить dependency-документацию

Используй type hints и docstring'и.

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

Autumn берет зависимости из type hints, а тексты - из docstring'ов.
