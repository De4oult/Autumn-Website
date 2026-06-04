---
title: Как документировать?
description: Подпишите маршруты, модели и зависимости так, чтобы документация шелестела пользой.
---

Autumn строит документацию из кода: маршрутов, type hints, Pydantic-моделей, `@serializable`-классов, DI-зависимостей и docstring'ов. Чем аккуратнее описаны типы, тем полезнее получается документация.

В коротких примерах часть импортов опущена, чтобы не заслонять сам прием документирования.

## Описывай контроллеры

Контроллер можно описать через `@description` или docstring.

::documentation-code
@tab description [python]
```python
from autumn.controller import REST
from autumn.documentation import description

@REST(prefix = '/users')
@description('Users management controller')
class UserController:
    ...
```

@tab docstring [python]
```python
from autumn.controller import REST

@REST(prefix = '/users')
class UserController:
    '''Users management controller'''
    ...
```
::

Если `@tag` не указан, tag контроллера строится из имени класса.

```python
class UserController:
    ...
```

Tag будет:

```text
User
```

## Используй summary и description для методов

Метод можно описать явно:

```python
from autumn.documentation import summary, description

@get('/test/{name:str}')
@summary('Test with Name')
@description('Method for testing')
async def get_test_user(self, name: str) -> UserSchema:
    return UserSchema(
        name = name, 
        age  = 15
    )
```

`@summary` становится коротким названием операции.

`@description` становится подробным описанием.

Если декораторов нет, Autumn попробует использовать docstring.

```python
@get('/{id:int}/name')
async def get_username_by_id(self, id: int) -> dict:
    """Returns name of user with id=."""
    return { 'name': self.users.get_username_by_id(id) }
```

## Группируй операции через tag

`@tag` можно использовать на классе или методе.

```python
from autumn.documentation import tag

@REST(prefix = '/users')
@tag('Users')
class UserController:
    ...
```

```python
@post
@tag('Deprecated')
async def create_user(self, user: UserSchema):
    ...
```

Tags `deprecated` и `depr` автоматически нормализуются в `Deprecated`, а операция помечается как deprecated в OpenAPI.

## Типизируй path и query параметры

Path-параметры описываются в route template.

```python
@get('/{id:int}')
async def get_user(self, id: int):
    return { 'id' : id }
```

Query-параметры описываются через `query`.

```python
from autumn.request import query

@get
@query.int('page', default = 10)
async def search(self, page: int):
    return { 'page' : page }
```

Так OpenAPI сможет показать параметры, типы, required/default.

## Используй Pydantic для request body

Если обработчик принимает JSON-body, опиши его Pydantic-моделью.

```python
from pydantic import BaseModel, Field

class UserSchema(BaseModel):
    name: str = Field(..., min_length = 4, max_length = 10)
    age:  int = Field(..., ge = 13, le = 150)

@post('/users')
async def create_user(self, user: UserSchema):
    return { 'ok': True }
```

Autumn добавит `requestBody` и schema в OpenAPI.

## Типизируй ответы

Return annotation помогает Autumn построить схему ответа.

```python
@get('/users/{name:str}')
async def get_user(self, name: str) -> UserSchema:
    return UserSchema(
        name = name, 
        age  = 15
    )
```

Для доменных объектов можно использовать `@serializable`.

```python
from autumn.serialization import serializable, Public, Private

@serializable
class User:
    def __init__(self, name: str, password: str):
        self.name:     Public[str]  = name
        self.password: Private[str] = password
```

Публичные поля попадут в JSON-схему, приватные - нет.

## Документируй зависимости

Dependencies-документация строится из `@service`, `@leaf`, type hints и docstring'ов.

```python
@leaf
async def db(configuration: DatabaseConfiguration) -> DBClient:
    """Create database client."""
    return DBClient(
        host = configuration.host,
        port = configuration.port    
    )

@service
class UserService:
    """User business logic."""

    def __init__(self, database: DBClient):
        self.database = database
```

Обязательно указывай return annotation у leaf-функций.

```python
@leaf
async def database() -> DBClient:
    return DBClient()
```

## Проверяй результат

После запуска приложения доступны:

```http
GET /documentation/openapi.json
GET /documentation/dependencies.json
GET /autumn
```

`/autumn` открывает встроенный интерфейс, где можно смотреть API и граф зависимостей.

## Практический минимум

Для хорошей документации обычно достаточно:
- писать type hints для параметров и ответов;
- использовать Pydantic для входных JSON-body;
- использовать `@serializable` для доменных ответов;
- добавлять `@summary` и `@description` на важные обработчики;
- добавлять docstring'и к сервисам, leaf-функциям и публичным методам сервисов;
- не забывать return annotation у `@leaf`.
