---
title: Валидация запроса
description: Проверьте входные данные до того, как они попадут в осенний сад приложения.
---

Autumn использует Pydantic для валидации JSON-body. Если параметр метода контроллера аннотирован моделью `BaseModel`, фреймворк сам прочитает тело запроса, распарсит JSON и передаст в метод уже провалидированный объект.

```python
from pydantic import BaseModel, Field
from autumn.controller import REST, post

class UserSchema(BaseModel):
    name: str = Field(..., min_length = 2, max_length = 10)
    age:  int = Field(..., ge = 13, le = 150)

@REST(prefix = '/users')
class UserController:
    @post
    async def create_user(self, user: UserSchema):
        print(user.age)

        ...
```

Для такого обработчика клиент должен отправить JSON:

```http
POST /users
Content-Type: application/json
```

```json
{
    "name": "Dima",
    "age": 18
}
```

## Правила валидации

Ограничения описываются в Pydantic-модели.

```python
from typing import Optional
from pydantic import BaseModel, Field

class UserSchema(BaseModel):
    name: str = Field(..., min_length = 4, max_length = 10)
    age:  int = Field(..., ge = 13, le = 150)

    is_male: Optional[bool] = None
```

В этом примере:

- `name` обязателен, минимум 4 символа, максимум 10;
- `age` обязателен, от 13 до 150;
- `is_male` необязателен и по умолчанию `None`.

## Что происходит внутри

Когда Autumn видит Pydantic-модель в сигнатуре метода, он считает этот параметр телом запроса.

```python
@post('/test')
async def create_user(self, user: UserSchema):
    self.user_service.create(user.name, user.age)
```

Фреймворк выполняет шаги:

1. читает тело запроса;
2. парсит его как JSON;
3. валидирует через Pydantic;
4. передает в метод объект `UserSchema`.

В одном обработчике поддерживается только один параметр тела запроса.

## Пустое тело запроса

Если тело запроса пустое, а параметр тела обязателен, Autumn вернет ошибку `400`.

```python
@post('/users')
async def create_user(self, user: UserSchema):
    return { 'ok': True }
```

Запрос без тела:

```http
POST /users
```

завершится ошибкой, потому что `user` невозможно собрать без JSON-body.

Если у параметра есть значение по умолчанию, оно будет использовано при пустом теле.

```python
@post('/users')
async def create_user(self, user: UserSchema = UserSchema(name = 'Guest', age = 18)):
    return { 'ok' : True }
```

## Невалидный JSON

Если тело запроса не является корректным JSON, Autumn вернет `400`.

```http
POST /users
Content-Type: application/json
```

```json
{ "name": "Dima",
```

Такое тело не получится распарсить, поэтому обработчик вызван не будет.

## Ошибки Pydantic-валидации

Если JSON корректный, но не проходит правила модели, Autumn вернет `422`.

```json
{
    "name": "Al",
    "age": 10
}
```

Для модели:

```python
class UserSchema(BaseModel):
    name: str = Field(..., min_length = 4, max_length = 10)
    age:  int = Field(..., ge = 13, le = 150)
```

такой payload невалиден: `name` слишком короткий, а `age` меньше допустимого значения.

## Ручная валидация

Если нужна нестандартная обработка, можно принять `Request` и самостоятельно прочитать JSON.

```python
from autumn import Request

@post('/compatibility/check')
async def check_compatibility(self, request: Request):
    payload = await request.json()

    if 'version' not in payload:
        return { 'ok' : False, 'error': 'version is required' }

    return { 'ok': True }
```

Для обычных DTO и входных форм лучше использовать Pydantic-модели: так контракт запроса остается видимым в сигнатуре метода и может попасть в документацию.
