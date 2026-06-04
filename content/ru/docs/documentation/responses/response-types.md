---
title: Типы ответов
description: Выберите форму ответа, которая лучше всего донесет данные до клиента.
---

Обработчик в Autumn может вернуть готовый response-объект или значение, которое фреймворк умеет автоматически превратить в JSON.

```python
from autumn.controller import REST, get
from autumn.response import JSONResponse

@REST()
class BaseController:
    @get('/healthcheck')
    async def get_base(self) -> JSONResponse:
        return JSONResponse({ 'health' : True })
```

## Автоматический JSON

Если метод возвращает `dict`, `list`, Pydantic-модель или объект, помеченный `@serializable`, Autumn сам обернет результат в `JSONResponse`.

```python
@REST(prefix = '/users')
class UserController:
    @get('/{id:int}')
    async def get_user(self, id: int):
        return { 'user_id' : id }
```

Ответ будет отправлен как JSON:

```json
{
    "user_id": 1
}
```

## JSONResponse

`JSONResponse` нужен, когда нужно явно вернуть JSON, задать статус или заголовки.

```python
from autumn.response import JSONResponse

@get('/users')
async def users(self):
    return JSONResponse(
        { 
            'items': [] 
        },
        status  = 200,
        headers = { 'X-Source': 'cache' }
    )
```

`JSONResponse` использует JSON-сериализацию Autumn, поэтому умеет работать с Pydantic-моделями и `@serializable`-объектами.

## HTMLResponse

`HTMLResponse` возвращает HTML.

```python
from autumn.response import HTMLResponse

@get('/hello')
async def hello(self):
    return HTMLResponse('<h1>Hello</h1>')
```

Content-Type ответа:

```http
text/html; charset=utf-8
```

## XMLResponse

`XMLResponse` возвращает XML.

```python
from autumn.response import XMLResponse

@get('/feed')
async def feed(self):
    return XMLResponse('<feed><title>Autumn</title></feed>')
```

Content-Type ответа:

```http
application/xml
```

## RedirectResponse

`RedirectResponse` отправляет редирект и устанавливает header `Location`.

```python
from autumn.response import RedirectResponse

@get('/old-page')
async def old_page(self):
    return RedirectResponse('/new-page')
```

По умолчанию используется статус `302`.

```python
return RedirectResponse('/new-page', status = 301)
```

## FileResponse

`FileResponse` читает файл целиком и отправляет его в ответе.

```python
from autumn.response import FileResponse

@get('/file/report')
async def download_file(self):
    return FileResponse(
        path     = 'report.pdf',
        download = True
    )
```

Если `download = True`, файл будет отправлен как attachment. Если `download = False`, браузер сможет открыть его inline, если поддерживает тип файла.

`content_type` определяется по имени файла автоматически, но его можно указать явно.

```python
return FileResponse(
    path         = 'data.bin',
    filename     = 'export.bin',
    content_type = 'application/octet-stream'
)
```

## StreamFileResponse

`StreamFileResponse` отправляет файл чанками. Это лучше подходит для больших файлов.

```python
from autumn.response import StreamFileResponse

@get('/file/large-archive')
async def stream_file(self):
    return StreamFileResponse(
        path       = 'large-archive.zip',
        download   = True,
        chunk_size = 5 * 1024
    )
```

В отличие от `FileResponse`, файл не читается целиком в память перед отправкой.

## Базовый Response

`Response` - базовый класс для простого текстового или бинарного ответа.

```python
from autumn.response import Response

@get('/plain')
async def plain(self):
    return Response(
        'Hello',
        status       = 200,
        content_type = 'text/plain; charset=utf-8'
    )
```

Если обработчик возвращает тип, который Autumn не умеет нормализовать в response, будет ошибка выполнения.
