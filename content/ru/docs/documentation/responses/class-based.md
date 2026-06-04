---
title: Свои классы ответов
description: Создавайте собственные ответы для повторяющихся форматов и заголовков.
---

Все response-типы в Autumn построены вокруг базового класса `Response`. Если стандартных ответов недостаточно, можно создать свой класс ответа.

```python
from autumn.response import Response

class TextResponse(Response):
    def __init__(self, body: str, status: int = 200):
        super().__init__(
            body         = body,
            status       = status,
            content_type = 'text/plain; charset=utf-8'
        )
```

Такой response можно вернуть из обработчика:

```python
from autumn.controller import REST, get

@REST()
class TextController:
    @get('/text')
    async def text(self):
        return TextResponse('Hello')
```

## Что хранит Response

Базовый `Response` содержит:

```python
response.body
response.status
response.content_type
response.headers
```

Минимальный пример:

```python
from autumn.response import Response

@get('/plain')
async def plain(self):
    return Response(
        body         = 'Hello',
        status       = 200,
        content_type = 'text/plain; charset=utf-8',
        headers      = { 'X-Mode': 'plain' }
    )
```

## JSON-ответ на базе класса

Классовый ответ удобен, когда нужно переиспользовать один формат ответа в разных контроллерах.

```python
from autumn.response import JSONResponse

class OkResponse(JSONResponse):
    def __init__(self, data = None, status: int = 200):
        super().__init__(
            {
                'ok': True,
                'data': data
            },
            status = status
        )
```

Использование:

```python
@get('/profile')
async def profile(self):
    return OkResponse({ 'name': 'Dima' })
```

Ответ:

```json
{
    "ok": true,
    "data": {
        "name": "Dima"
    }
}
```

## Заголовки в классовом ответе

Заголовки можно передавать в `super().__init__`.

```python
class CachedJSONResponse(JSONResponse):
    def __init__(self, body, max_age: int = 60):
        super().__init__(
            body,
            headers={
                'Cache-Control': f'public, max-age={max_age}'
            }
        )
```

Теперь любой обработчик может вернуть кешируемый JSON:

```python
@get('/settings')
async def settings(self):
    return CachedJSONResponse({ 'theme' : 'dark' }, max_age = 300)
```

## Стриминговый ответ

Autumn отправляет response как stream, если у объекта есть async-метод `body_iterate()`. Так работает `StreamFileResponse`.

```python
from autumn.response import Response

class ChunkedTextResponse(Response):
    def __init__(self):
        super().__init__(
            body         = b'',
            status       = 200,
            content_type = 'text/plain; charset=utf-8'
        )

    async def body_iterate(self):
        yield b'first\n'
        yield b'second\n'
        yield b'third\n'
```

Использование:

```python
@get('/stream')
async def stream(self):
    return ChunkedTextResponse()
```

Если `body_iterate()` есть, Autumn будет отправлять чанки по одному и завершит ответ пустым финальным chunk'ом.

## Когда создавать свой response

Свой класс ответа стоит создавать, когда один и тот же формат повторяется в нескольких местах:

- единый формат `{ ok, data }`;
- одинаковые cache-заголовки;
- специфичный `content_type`;
- stream-ответ;
- интеграция с внешним форматом.

Для обычного JSON чаще достаточно вернуть `dict` или использовать `JSONResponse`.
