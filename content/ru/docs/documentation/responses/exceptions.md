---
title: Исключения
description: Возвращайте HTTP-ошибки предсказуемо, даже когда в саду что-то пошло не так.
---

Для HTTP-ошибок в Autumn используется `HTTPException`. Его можно выбросить из контроллера, middleware или любого кода, который вызывается во время обработки запроса.

```python
from autumn.controller import REST, get
from autumn.response import HTTPException

@REST(prefix = '/users')
class UserController:
    @get('/teapot')
    async def get_teapot(self):
        raise HTTPException(status = 418)
```

Такой обработчик завершит запрос ответом со статусом `418`.

## Статус, title и details

`HTTPException` принимает `status`, `title` и `details`.

```python
raise HTTPException(
    status  = 404,
    title   = 'User not found',
    details = 'User with this id does not exist'
)
```

Если `title` не передан, Autumn подставит стандартный title для известных статусов. `details` по умолчанию будет пустой строкой.

JSON-ответ ошибки выглядит так:

```json
{
    "status"  : 404,
    "title"   : "User not found",
    "details" : "User with this id does not exist"
}
```

## Формат ответа

Autumn умеет отдавать ошибку как JSON или HTML.

Если клиент явно предпочитает HTML через header `Accept`, будет возвращена HTML-страница ошибки.

```http
Accept: text/html
```

Если HTML не запрошен, ошибка возвращается как JSON.

```http
Accept: application/json
```

## Ошибки валидации

Некоторые ошибки Autumn выбрасывает автоматически.

Если обязательный query-параметр не передан:

```python
from autumn.request import query

@get('/search')
@query.string('name', required = True)
async def search(self, name: str):
    return { 'name' : name }
```

Запрос без `name` вернет `400`.

Если тело запроса не проходит Pydantic-валидацию, Autumn вернет `422`.

```python
from pydantic import BaseModel, Field

class UserSchema(BaseModel):
    age: int = Field(..., ge = 13)
```

```json
{
    "age": 10
}
```

Такой payload не пройдет валидацию.

## Необработанные исключения

Если во время обработки запроса возникает обычное исключение, Autumn перехватывает его и возвращает `500`.

```python
@get('/exception')
async def exception(self):
    return { 'answer' : 1 / 0 }
```

Клиент получит HTTP-ответ со статусом `500`, а текст исключения попадет в `details`.

## Обработка через middleware

Ошибки можно перехватывать в middleware и возвращать свой ответ.

```python
from autumn import Request, middleware
from autumn.response import JSONResponse

@middleware
async def catch_exception(request: Request, call):
    try:
        return await call(request)
    except Exception:
        return JSONResponse({ 'error': True }, status = 500)
```

Такой middleware полезен, если нужно централизованно изменить формат ошибок или добавить логирование.
