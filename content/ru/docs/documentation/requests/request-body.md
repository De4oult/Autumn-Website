---
title: Тело запроса
description: Разберите тело запроса без тумана и передайте данные в обработчик.
---

В Autumn данные из запроса можно получать двумя основными способами: через аргументы метода контроллера или через объект `Request`.

Аргументы метода удобны, когда параметр является частью публичного контракта маршрута. `Request` полезен, когда нужен прямой доступ к данным исходного HTTP-запроса.

## Request в методе контроллера

Чтобы получить объект запроса, добавь аргумент `request: Request`.

```python
from autumn import Request
from autumn.controller import REST, get

@REST(prefix = '/users')
class UserController:
    @get('/current/{name:str}')
    async def current_name(self, request: Request, name: str):
        return {
            'meta' : {
                'status' : 200,
                'method' : request.method,
                'path'   : request.path
            },
            'data' : {
                'name' : name
            }
        }
```

`Request` содержит базовую информацию о запросе:

```python
request.method
request.path
request.headers
request.query
```

## Тело запроса

Для ручной работы с телом запроса используй методы `request.body()` и `request.json()`.

```python
from autumn import Request
from autumn.controller import REST, post

@REST(prefix = '/users')
class UserController:
    @post('/raw')
    async def raw_create(self, request: Request):
        payload = await request.json()
        return { 
            'payload' : payload 
        }
```

`request.body()` возвращает сырые байты тела запроса, а `request.json()` парсит тело как JSON.

```python
raw     = await request.body()
payload = await request.json()
```

Если параметр метода аннотирован Pydantic-моделью, Autumn сам прочитает JSON-body, провалидирует его и передаст готовый объект в метод.

```python
from pydantic import BaseModel

class UserSchema(BaseModel):
    name: str
    age:  int

@REST(prefix = '/users')
class UserController:
    @post
    async def create_user(self, user: UserSchema):
        return { 
            'user': user.model_dump(mode = 'json') 
        }
```

Такой подход обычно удобнее ручного чтения `request.json()`, когда у запроса есть ожидаемая структура.
