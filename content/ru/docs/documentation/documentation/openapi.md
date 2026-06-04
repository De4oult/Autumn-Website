---
title: OpenAPI
description: Покажите API в ясной схеме, чтобы каждый маршрут был виден сквозь осенний туман.
---

Autumn автоматически собирает OpenAPI-схему для HTTP-маршрутов контроллеров. Схема доступна по встроенному маршруту:

```http
GET /documentation/openapi.json
```

Этот JSON используется встроенным интерфейсом документации и может быть подключен к внешним инструментам, которые понимают OpenAPI `3.0.3`.

В примерах ниже часть импортов опущена, если фрагмент показывает только конкретную возможность документации.

## Что попадает в схему

Autumn проходит по зарегистрированным маршрутам контроллеров и строит `paths`.

```python
from autumn.controller import REST, get

@REST(prefix = '/users')
class UserController:
    @get('/{name:str}')
    async def get_user(self, name: str):
        return { 'name' : name }
```

Такой route попадет в OpenAPI как:

```http
GET /users/{name}
```

Path-параметры описываются автоматически.

## Path-параметры

Типы path-параметров берутся из шаблона маршрута.

```python
@get('/{id:int}')
async def get_user(self, id: int):
    return { 'id': id }
```

Для `id` будет создан OpenAPI parameter:

```json
{
    "name" : "id",
    "in" : "path",
    "required" : true,
    "schema" : {
        "type" : "integer"
    }
}
```

Поддерживаются типы `str`, `int`, `float`, `uuid`.

## Query-параметры

Query-параметры попадают в схему, если объявлены через `query`.

```python
from autumn.request import query

@get
@query.int('page', default = 10)
async def search(self, page: int):
    return { 'page' : page }
```

В OpenAPI будет указан query-параметр `page` со схемой `integer` и default `10`.

Если query-параметр помечен как `required=True`, это также попадет в схему.

## Request body

Если метод принимает Pydantic-модель как body-параметр, Autumn добавит `requestBody`.

```python
from pydantic import BaseModel, Field

class UserSchema(BaseModel):
    name: str = Field(..., min_length = 4)
    age: int

@post
async def create_user(self, user: UserSchema):
    return { 'ok' : True }
```

OpenAPI-схема будет содержать JSON-body с Pydantic-схемой `UserSchema`.

## Response schema

Autumn умеет строить JSON-схему ответа по return annotation.

```python
@get('/current/{name:str}')
async def get_test_user(self, name: str) -> UserSchema:
    return UserSchema(
        name = name, 
        age  = 15
    )
```

Если метод возвращает Pydantic-модель, `dict`, `list` или `@serializable`-тип, ответ будет описан как `application/json`.

```python
@serializable
class User:
    name: Public[str]

@get('/{name:str}')
async def get_user(self, name: str) -> User:
    return User(name)
```

## Ошибки в OpenAPI

Autumn добавляет базовые ответы:
- `200` - успешный ответ;
- `400` - если у метода есть query-параметры;
- `422` - если у метода есть request body;
- `500` - внутренняя ошибка.

Если в исходном коде метода найден `HTTPException(status = ...)`, этот статус также добавляется в ответы.

```python
from autumn.response import HTTPException

@get('/teapot')
async def get_teapot(self):
    raise HTTPException(status = 418)
```

В схеме появится ответ `418`.

## Tags

По умолчанию tag берется из имени контроллера без суффикса `Controller`.

```python
@REST(prefix = '/users')
class UserController:
    ...
```

Tag будет:

```text
User
```

Tag можно переопределить декоратором `@tag`.

```python
from autumn.documentation import tag

@REST(prefix = '/users')
@tag('Users')
class UserController:
    ...
```

Методам тоже можно добавлять дополнительные tags.

```python
@post('/test')
@tag('Deprecated')
async def create_user(self, user: UserSchema):
    ...
```

Тэги `deprecated` и `depr` нормализуются в `Deprecated`, а операция помечается как deprecated.

## Summary и description

Для ручного описания операций используются декораторы `@summary` и `@description`.

```python
from autumn.documentation import summary, description

@get('/test_json_response/{name:str}')
@summary('Test JSON response')
@description('A really nice method')
async def get_test_user(self, name: str) -> UserSchema:
    return UserSchema(
        name = name, 
        age  = 15
    )
```

Если декораторы не указаны, Autumn попробует использовать docstring метода. Если docstring тоже нет, summary будет равен имени метода.

## Встроенный интерфейс

OpenAPI можно смотреть через JSON endpoint:

```http
GET /documentation/openapi.json
```

И через веб-интерфейс Autumn:

```http
GET /autumn
```
