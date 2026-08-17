---
title: Валидация
description: Позвольте Autumn валидировать body и query-параметры до вызова handler'а.
---

Autumn валидирует тело запроса через Pydantic-модели, а query-параметры — через декораторы `query`.

## Валидация тела запроса

Объяви Pydantic-модель в сигнатуре handler'а.

```python
from pydantic import BaseModel, Field

from autumn.controller import REST, post

class UserSchema(BaseModel):
    name: str = Field(..., min_length = 4, max_length = 10)
    age: int = Field(..., ge = 13, le = 150)

@REST(prefix = '/users')
class UserController:
    @post('/')
    async def create_user(self, user: UserSchema):
        return user
```

Autumn:

1. читает тело запроса;
2. парсит его как JSON;
3. валидирует через Pydantic;
4. передаёт в handler объект `UserSchema`.

В одном handler'е поддерживается только один параметр тела запроса.

## Ошибки Pydantic

Если JSON корректный, но не проходит правила модели, Autumn возвращает `422`.

```json
{
    "code": "VALIDATION_ERROR",
    "details": "Request validation failed",
    "fields": [
        {
            "source": "body",
            "field": "age",
            "input": 10,
            "error": "Input should be greater than or equal to 13"
        }
    ],
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```

Для кастомных Pydantic validators Autumn оставляет сообщение валидатора чистым:

```python
from pydantic import BaseModel, model_validator

class PhoneStartRequest(BaseModel):
    region: str
    phone: str

    @model_validator(mode = 'after')
    def validate_region(self):
        if len(self.region) != 2:
            raise ValueError('Region must be an ISO 3166-1 alpha-2 country code')

        return self
```

Ответ:

```json
{
    "code": "VALIDATION_ERROR",
    "details": "Request validation failed",
    "fields": [
        {
            "source": "body",
            "field": "body",
            "input": {
                "region": "",
                "phone": "+37377932972"
            },
            "error": "Region must be an ISO 3166-1 alpha-2 country code"
        }
    ],
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```

## Валидация query-параметров

Используй декораторы `query`, если handler'у нужны типизированные query-параметры.

```python
from autumn.controller import REST, get
from autumn.request import query

@REST(prefix = '/users')
class UserController:
    @get('/search')
    @query.string('name', required = True)
    @query.int('page', default = 1)
    async def search(self, name: str, page: int):
        return {
            'name': name,
            'page': page
        }
```

Если обязательный query-параметр отсутствует, Autumn возвращает `400` в том же формате:

```json
{
    "code": "VALIDATION_ERROR",
    "details": "Request validation failed",
    "fields": [
        {
            "source": "query",
            "field": "name",
            "input": null,
            "error": "Field required"
        }
    ],
    "request_id": "req-123",
    "timestamp": "2026-08-17T10:15:30.000000+00:00"
}
```

Если значение не получилось привести к нужному типу, `input` содержит исходное query-значение.

## Пустое тело запроса

Если тело запроса пустое, а параметр тела обязателен, Autumn возвращает `400`.

```python
@post('/users')
async def create_user(self, user: UserSchema):
    return { 'ok': True }
```

Если у параметра есть значение по умолчанию, Autumn использует его при пустом теле.

```python
@post('/users')
async def create_user(self, user: UserSchema = UserSchema(name = 'Guest', age = 18)):
    return { 'ok': True }
```

## Невалидный JSON

Если тело запроса не является корректным JSON, Autumn возвращает `400`.

```http
POST /users
Content-Type: application/json
```

```json
{ "name": "Dima",
```

Handler вызван не будет.

## Ручная валидация

Если нужна нестандартная совместимость, можно принять `Request` и самостоятельно прочитать JSON.

```python
from autumn import Request

@post('/compatibility/check')
async def check_compatibility(self, request: Request):
    payload = await request.json()

    if 'version' not in payload:
        return { 'ok': False, 'error': 'version is required' }

    return { 'ok': True }
```

Для обычных DTO и входных форм лучше использовать Pydantic-модели: контракт запроса остаётся видимым в сигнатуре метода и может попасть в документацию.
