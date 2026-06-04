---
title: Базовые маршруты
description: Осенняя тропинка от контроллера к первому HTTP-маршруту.
---

Контроллер в Autumn - это обычный Python-класс, помеченный декоратором `@REST()`. Методы контроллера становятся HTTP-маршрутами, если над ними указан декоратор метода: `@get`, `@post`, `@put`, `@patch` или `@delete`.

```python
from autumn.controller import REST, get
from autumn.response import JSONResponse

@REST()
class BaseController:
    @get('/healthcheck')
    async def get_healthcheck(self) -> JSONResponse:
        return JSONResponse({ 'health': True })
```

В этом примере будет зарегистрирован маршрут:
```http
GET /healthcheck
```

## Prefix контроллера

Если несколько маршрутов относятся к одной группе, им можно задать общий префикс через `@REST(prefix = '...')`.

```python
@REST(prefix = '/users')
class UserController:
    @get
    async def get_user(self) -> JSONResponse:
        ...

    @post
    async def create_new(self) -> JSONResponse:
        ...
```

Итоговые маршруты:
```http
GET  /users/
POST /users/
```

Autumn сам склеивает `prefix` и путь метода. Если путь у декоратора метода не передан, используется `/`, поэтому маршрут будет указывать прямо на префикс:

```python
@REST(prefix = '/users')
class UserController:
    @get
    async def get_user(self) -> JSONResponse:
        ...
```

```http
GET /users
GET /users/
```

Оба варианта с завершающим `/` и без него сопоставляются роутером.

## Короткая запись

Если путь не передан, используется `/`.

```python
@REST(prefix = '/status')
class StatusController:
    @get
    async def index(self):
        return { 'ok' : True }
```

Такой метод будет доступен по:

```http
GET /status
```

## Возвращаемые значения

Метод контроллера может вернуть готовый response-объект:

```python
from autumn.response import JSONResponse, HTMLResponse

@get('/json')
async def json_page(self):
    return JSONResponse({ 'ok' : True })

@get('/html')
async def html_page(self):
    return HTMLResponse('<h1>Hello</h1>')
```

Также можно вернуть обычный словарь или сериализуемый объект - Autumn передаст результат через свой механизм обработки ответа.
