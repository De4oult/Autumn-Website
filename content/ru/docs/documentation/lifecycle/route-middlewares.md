---
title: Middleware маршрута
description: Привяжите middleware к конкретным маршрутам, как листья к своим веткам.
---

Route middleware - это `@middleware`, `@middleware.before()` или `@middleware.after()`, ограниченный конкретным маршрутом, методом или их комбинацией.

Такой middleware объявляется на уровне модуля, поэтому функция принимает `request` и `call`. Если тот же декоратор используется внутри класса `@REST`, Autumn распознает метод контроллера и регистрирует controller middleware.

```python
from autumn import Request, middleware

@middleware(
    path   = '/users/current/{name:str}', 
    method = 'GET'
)
async def current_user_guard(request: Request, call):
    print('Current user route')

    return await call(request)
```

Такой middleware выполнится только для запросов, путь которых совпадает с шаблоном. Например:

```http
GET /users/current/dima
```

## Фильтрация по path

Параметр `path` задает шаблон маршрута.

```python
@middleware(path = '/users/current/{name:str}')
async def only_current_user(request: Request, call):
    return await call(request)
```

Path-параметры в шаблоне middleware записываются так же, как в маршрутах:

```python
'/users/current/{name:str}'
```

При сопоставлении middleware Autumn заменяет сегменты в фигурных скобках на `[^/]+`, поэтому middleware будет применяться к любому значению этого сегмента.

```http
GET /users/current/dima
GET /users/current/alex
```

## Фильтрация по method

Параметр `method` ограничивает middleware HTTP-методом.

```python
@middleware(method = 'POST')
async def only_post(request: Request, call):
    return await call(request)
```

Такой middleware применится к `POST`-запросам.

Обычно `method` указывают вместе с `path`, чтобы middleware был привязан к конкретному обработчику.

```python
@middleware.after(path = '/users/test', method = 'POST')
async def log_create_user(request: Request, response):
    print('<< Response sent:', response.status)

    return response
```

`path` и `method` можно задавать строкой или списком/кортежем строк.

```python
@middleware(
    path   = ('/users', '/profiles'),
    method = ['GET', 'POST']
)
async def users_or_profiles(request: Request, call):
    return await call(request)
```

## Before для конкретного маршрута

`@middleware.before(path = ..., method = ...)` полезен для проверок перед отдельным обработчиком маршрута.

```python
from autumn.response import JSONResponse

@middleware.before(path = '/admin/users', method = 'GET')
async def admin_guard(request: Request, call):
    if request.header('authorization') is None:
        return JSONResponse({ 'error': 'Unauthorized' }, status = 401)

    return await call(request)
```

Если middleware возвращает response без вызова `call`, обработчик маршрута не будет вызван.

## After для конкретного маршрута

`@middleware.after(path = ..., method = ...)` полезен для логирования или модификации ответа отдельного маршрута.

```python
@middleware.after(path = '/users/test', method = 'POST')
async def stamp_create_user(request: Request, response):
    response.headers['X-Route'] = 'create-user'

    return response
```

## Важная деталь про path

Middleware сопоставляется с `path_template` зарегистрированного маршрута, а не с исходным URL как строкой.

Например, если маршрут объявлен так:

```python
@REST(prefix = '/users')
class UserController:
    @get('/current/{name:str}')
    async def current_name(self, name: str):
        return { 'name': name }
```

то middleware нужно писать под итоговый шаблон:

```python
@middleware.before(path = '/users/current/{name:str}', method = 'GET')
async def test(request: Request, call):
    return await call(request)
```

Именно такой вариант используется в примере приложения.

## Когда использовать route middleware

Route middleware стоит использовать, когда логика нужна нескольким местам lifecycle, но не всему приложению:
- проверка прав для конкретного обработчика;
- логирование чувствительной операции;
- добавление заголовка только одному маршруту;
- временная совместимость для старого API;
- точечная обработка ошибок.

Если логика относится ко всем методам одного контроллера, чаще удобнее использовать middleware контроллера.
