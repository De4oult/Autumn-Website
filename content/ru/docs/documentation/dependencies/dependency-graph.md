---
title: Граф зависимостей
description: Проследите связи контейнера от корней до последних листьев.
---
Autumn собирает информацию о DI-контейнере и отдает ее через встроенный маршрут:

```http
GET /documentation/dependencies.json
```

Этот JSON используется страницей `/autumn`, чтобы показать сервисы, leaf-функции, конфигурации и связи между ними.

## Из чего строится граф

Граф строится из type hints:

- параметры `__init__` у сервисов;
- параметры leaf-функций;
- тип, который leaf возвращает;
- зарегистрированные конфигурации;
- scope и lifecycle провайдеров.

Пример:

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

Связи будут такими:

```text
UserService -> DBClient
DBClient -> DatabaseConfiguration
```

`DBClient` появляется в графе как leaf-зависимость, потому что его предоставляет функция `database`.

## Что попадает в dependencies.json

Ответ содержит несколько основных секций:

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

`services` содержит сервисы, зарегистрированные через `@service`.

`leaf` содержит зависимости, зарегистрированные через `@leaf`.

`configurations` содержит классы конфигурации.

`graph` содержит дерево связей между зависимостями.

## Как Autumn определяет зависимости

Autumn смотрит только на параметры с type hints.

```python
@service
class UserService:
    def __init__(self, database: DBClient):
        self.database = database
```

Здесь `DBClient` попадет в граф.

Если type hint не указан, зависимость не будет видна контейнеру и документации.

```python
# Так не надо
@service
class UserService:
    def __init__(self, database):
        self.database = database
```

Такой параметр нельзя надежно разрешить через DI.

## Scope и lifecycle в графе

Для каждой зависимости Autumn показывает scope и lifecycle.

| Scope       | Lifecycle   |
| ----------- | ----------- |
| `app`       | `singleton` |
| `request`   | `scoped`    |
| `websocket` | `scoped`    |
| `transient` | `transient` |

Это помогает быстро понять, какие объекты живут все время работы приложения, а какие создаются на запрос.

## Циклические и повторные ссылки

Документация графа защищается от бесконечного обхода. Если зависимость уже была встречена выше по цепочке, она отображается как ссылка, а не разворачивается повторно.

```text
A -> B -> A
```

Такой граф не должен ломать страницу документации, но сам цикл зависимостей в архитектуре обычно стоит пересмотреть.

## Использование в разработке

Граф зависимостей полезен, когда приложение растет:

- видно, какие сервисы зависят от инфраструктуры;
- проще найти слишком большой сервис;
- можно проверить, что контроллер зависит от сервиса, а не напрямую от клиента базы;
- легче увидеть scope каждой зависимости;
- проще объяснить устройство приложения новому разработчику.

## Минимальный пример

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

После запуска приложения dependency-документацию можно получить по:

```http
GET /documentation/dependencies.json
```

А визуальную страницу с графом - через встроенный интерфейс Autumn.
