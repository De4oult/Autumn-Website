---
title: Заголовки
description: Читайте и задавайте HTTP-заголовки без лишнего шороха в обработчиках.
---

HTTP-заголовки доступны через объект `Request`. Чтобы получить запрос в методе контроллера, добавь аргумент `request: Request`.

```python
from autumn import Request
from autumn.controller import REST, get

@REST(prefix = '/profile')
class ProfileController:
    @get('/me')
    async def me(self, request: Request):
        authorization = request.header('authorization')

        return {
            'authorization': authorization
        }
```

## Чтение одного заголовка

Для чтения одного заголовка используй метод `request.header(name)`.

```python
token  = request.header('authorization')
accept = request.header('accept')
```

Метод возвращает строку или `None`, если заголовок не был передан.

```python
if request.header('authorization') is None:
    return { 'authorized': False }
```

Имена заголовков можно передавать в любом регистре:

```python
request.header('Authorization')
request.header('authorization')
request.header('AUTHORIZATION')
```

Внутри Autumn имена заголовков нормализуются к нижнему регистру.

## Все заголовки запроса

Все заголовки доступны через `request.headers`.

```python
@REST(prefix = '/debug')
class DebugController:
    @get('/headers')
    async def headers(self, request: Request):
        return {
            'headers': request.headers
        }
```

`request.headers` - это словарь, где ключи приведены к нижнему регистру.

```python
{
    'host'          : 'localhost:8080',
    'accept'        : 'application/json',
    'authorization' : 'Bearer token'
}
```

## Заголовки в middleware

Заголовки можно читать не только в контроллерах, но и в middleware.

```python
from autumn import Request, middleware

@middleware
async def log_request(request: Request, call):
    print(request.method, request.path, request.header('user-agent'))

    return await call(request)
```

Это удобно для логирования, авторизации и общей обработки запросов.

## Заголовки ответа

Заголовки ответа задаются на response-объекте.

```python
from autumn import middleware
from autumn.controller import REST, get

@REST(prefix = '/users')
class UserController:
    @middleware.after
    def stamp(self, response) -> None:
        response.headers['X-Controller'] = 'users'

    @get('/current')
    async def current(self):
        return { 'ok': True }
```

В этом примере каждый ответ контроллера получит header:

```http
X-Controller: users
```

Заголовки также можно передавать при создании response-объекта, если конкретный response-класс это поддерживает.

```python
from autumn.response import JSONResponse

@get('/healthcheck')
async def healthcheck(self):
    return JSONResponse(
        { 'health': True },
        headers = { 'X-Service': 'autumn' }
    )
```

## CORS и allowed_headers

Если приложение принимает браузерные запросы с кастомными заголовками, их нужно разрешить в CORS-конфигурации.

```python
from autumn.configuration import CORSConfiguration

class MyCORSConfiguration(CORSConfiguration):
    allowed_origins = ['*']
    allowed_methods = ['POST']
    allowed_headers = ['authorization']
```

В этом примере браузеру разрешено отправлять заголовок `authorization` в CORS-запросах.
