---
title: Исключения
description: Возвращайте предсказуемые HTTP-ошибки и оставляйте неожиданные сбои видимыми в консоли.
---

Для ожидаемых HTTP-ошибок Autumn использует `HTTPException`. Его можно выбросить из контроллера, middleware, сервиса или любого кода, который вызывается во время обработки запроса.

```python
from autumn.controller import REST, get
from autumn.response import HTTPException

@REST(prefix = '/users')
class UserController:
    @get('/{id:int}')
    async def get_user(self, id: int):
        raise HTTPException(
            status = 404,
            code = 'USER_NOT_FOUND',
            details = 'User with this id does not exist'
        )
```

## Формат ошибки

JSON-ошибки используют единый стабильный формат:

```json
{
    "code": "USER_NOT_FOUND",
    "details": "User with this id does not exist",
    "request_id": "req-01H...",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```

`code` — машинный код ошибки. Если его не передать, Autumn использует название HTTP-статуса:

| Status | Default code |
| ------ | ------------ |
| `400`  | `BAD_REQUEST` |
| `404`  | `NOT_FOUND` |
| `405`  | `METHOD_NOT_ALLOWED` |
| `422`  | `UNPROCESSABLE_ENTITY` |
| `500`  | `INTERNAL_SERVER_ERROR` |

Для доменных ошибок передавай собственный код:

```python
raise HTTPException(
    status = 400,
    code = 'INVALID_OR_EXPIRED_CHALLENGE',
    details = 'Challenge is invalid or expired'
)
```

Ответ:

```json
{
    "code": "INVALID_OR_EXPIRED_CHALLENGE",
    "details": "Challenge is invalid or expired",
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```

## Ошибки полей

Ошибки валидации содержат `fields`.

```json
{
    "code": "VALIDATION_ERROR",
    "details": "Request validation failed",
    "fields": [
        {
            "source": "body",
            "field": "region",
            "input": "",
            "error": "Region must be an ISO 3166-1 alpha-2 country code"
        }
    ],
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```

`source` показывает, откуда пришло невалидное значение:

- `body` — ошибка Pydantic-валидации тела запроса;
- `query` — ошибка параметра, объявленного через `@query.string`, `@query.int`, `@query.float` или `@query.uuid`.

Вложенные поля отображаются через точку, например `device.id`.

## Request ID

Каждый HTTP-ответ получает заголовок `X-Request-ID`.

Autumn использует первое доступное значение:

- `X-Request-ID`
- `X-Correlation-ID`
- автоматически сгенерированный id

Тот же id попадает в JSON-ответ с ошибкой.

```http
X-Request-ID: req-123
```

```json
{
    "code": "CONFLICT",
    "details": "Email already exists",
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```

## Meta и custom body

Используй `meta`, если к стандартному формату ошибки нужно добавить структурированные данные.

```python
raise HTTPException(
    status = 409,
    code = 'EMAIL_ALREADY_EXISTS',
    details = 'Email already exists',
    meta = {
        'field': 'email'
    }
)
```

JSON-ответ:

```json
{
    "code": "EMAIL_ALREADY_EXISTS",
    "details": "Email already exists",
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00",
    "meta": {
        "field": "email"
    }
}
```

Если нужен полностью свой payload ошибки, передай `body`.

```python
raise HTTPException(
    status = 400,
    body = {
        'error': 'invalid_payload'
    }
)
```

Autumn всё равно добавит `request_id`, если custom body ещё не содержит его.

## HTML или JSON

Autumn может возвращать ошибки как JSON или HTML.

Если клиент явно предпочитает HTML через `Accept`, будет возвращена HTML-страница ошибки. API-клиенты обычно получают JSON.

```http
Accept: text/html
```

## Method Not Allowed

Если путь маршрута существует, но HTTP-метод не совпадает, Autumn возвращает `405 Method Not Allowed`, а не `404`.

```python
@REST(prefix = '/test')
class TestController:
    @get('/')
    async def index(self):
        return { 'ok': True }
```

`POST /test` вернет:

```json
{
    "code": "METHOD_NOT_ALLOWED",
    "details": "Method POST is not allowed for /test",
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```

В ответ также добавляется заголовок `Allow` со списком доступных методов.

## Traceback в консоли

`HTTPException` — ожидаемый сценарий приложения, поэтому Autumn не выводит его в консоль.

Необработанные exception считаются внутренней ошибкой. Autumn печатает полный traceback в консоль и возвращает `500`. В production детали ответа остаются обобщёнными:

```json
{
    "code": "INTERNAL_SERVER_ERROR",
    "details": "Internal Server Error",
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```
