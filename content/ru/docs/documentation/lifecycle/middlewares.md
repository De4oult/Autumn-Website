---
title: Middleware
description: Оборачивайте HTTP-запросы общей логикой до и после обработчика.
---

Middleware позволяет выполнить код вокруг обработки HTTP-запроса. В Autumn middleware объявляются через единый декоратор `@middleware`.

Один и тот же декоратор используется в двух местах:
- на уровне модуля он регистрирует глобальный или route middleware;
- внутри класса `@REST` он помечает метод как middleware контроллера.

```python
from autumn import Request, middleware

@middleware
async def log_request(request: Request, call):
    print('>> Request received: ', request.method, request.path)

    return await call(request)
```

`@middleware` принимает `request` и `call`. Чтобы передать запрос дальше, нужно вызвать:

```python
return await call(request)
```

Для middleware на уровне модуля функция принимает `request` и `call`. Для middleware внутри контроллера форма другая: метод объявляется внутри класса и может работать через `yield`, `request`, path-параметры и зависимости контроллера.

## Around middleware

`@middleware` и `@middleware.before()` оборачивают обработчик маршрута.

```python
@middleware
async def log_request(request: Request, call):
    print(request.method, request.path)

    response = await call(request)

    return response
```

В таком middleware можно:
- логировать запрос;
- проверить авторизацию;
- изменить `request`;
- остановить обработку и вернуть response сразу;
- обернуть обработчик в `try/except`.

Пример раннего ответа:
```python
from autumn.response import JSONResponse

@middleware.before()
async def require_token(request: Request, call):
    if request.header('authorization') is None:
        return JSONResponse({ 'error': 'Unauthorized' }, status = 401)

    return await call(request)
```

## After middleware

`@middleware.after()` выполняется после обработчика маршрута. Он получает `request` и уже готовый `response`, поэтому вызов обработчика не нужен.

```python
from autumn import middleware

@middleware.after()
async def log_response(request: Request, response):
    print('<< Response sent:', response.status)

    return response
```

В `@middleware.after()` удобно менять заголовки ответа:

```python
@middleware.after()
async def add_header(request: Request, response):
    response.headers['X-App'] = 'autumn'

    return response
```

## Порядок выполнения

Если зарегистрировано несколько `@middleware` или `@middleware.before()`, они оборачивают обработчик в порядке регистрации.

```python
@middleware
async def first(request, call):
    print('first before')

    response = await call(request)

    print('first after')

    return response

@middleware
async def second(request, call):
    print('second before')

    response = await call(request)

    print('second after')

    return response
```

Логика будет похожа на цепочку:

```text
first before
second before
обработчик
second after
first after
```

`@middleware.after()` выполняются после этой цепочки в порядке регистрации.

## Обработка исключений

`@middleware` можно использовать как централизованный обработчик ошибок.

```python
from autumn.response import JSONResponse

@middleware
async def catch_exception(request: Request, call):
    try:
        return await call(request)

    except Exception:
        return JSONResponse({ 'error': True }, status = 500)
```

Такой middleware перехватит исключения, которые возникли ниже по цепочке.

## Глобальный middleware

Если `path` и `method` не указаны, middleware применяется ко всем HTTP-маршрутам.

```python
@middleware
async def global_logger(request: Request, call):
    print(request.method, request.path)

    return await call(request)
```

Для обработки только конкретных маршрутов используй route middleware с параметрами `path` и `method`.
