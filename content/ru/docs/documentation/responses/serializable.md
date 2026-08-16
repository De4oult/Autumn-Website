---
title: @serializable
description: Превращайте доменные объекты в JSON, оставляя приватные поля под опавшими листьями.
---

`@serializable` позволяет возвращать обычные Python-объекты из контроллеров как JSON. Это удобно, когда не хочется делать DTO на Pydantic, но нужно явно управлять публичными и приватными полями.

```python
from autumn.serialization import serializable, Public, Private

@serializable
class User:
    def __init__(self, name, age, password):
        self.id:   Public[int] = 1
        self.name: Public[str] = name
        self.age:  Public[int] = age

        self.password: Private[str] = password
```

Такой объект можно вернуть напрямую из обработчика:

```python
from autumn.controller import REST, get

@REST(prefix = '/users')
class UserController:
    @get('/{name:str}')
    async def get_user(self, name: str):
        return User(name, 18, 'qwerty123!')
```

Ответ будет JSON:

```json
{
    "id": 1,
    "name": "dima",
    "age": 18
}
```

Поле `password` не попадет в ответ, потому что оно помечено как `Private`.

## Public и Private

`Public` и `Private` используются как type annotation.

```python
self.name:     Public[str]  = name
self.password: Private[str] = password
```

`Public` означает, что поле можно сериализовать в JSON.

`Private` означает, что поле нужно исключить из JSON-ответа.

Если поле не помечено ни `Public`, ни `Private`, но существует в `vars(object)` и не начинается с `_`, Autumn тоже добавит его в JSON.

```python
@serializable
class Product:
    def __init__(self, title: str):
        self.title = title
```

```json
{
    "title": "Book"
}
```

## Аннотации в __init__

Autumn умеет находить поля, аннотированные внутри `__init__`.

```python
@serializable
class User:
    def __init__(self, name: str):
        self.name:  Public[str]  = name
        self.token: Private[str] = 'secret'
```

Это удобно для классов, где поля создаются при инициализации объекта.

## Аннотации на уровне класса

Поля можно описывать и на уровне класса.

```python
@serializable
class User:
    id:       Public[int]
    name:     Public[str]
    password: Private[str]

    def __init__(self, name: str, password: str):
        self.id       = 1
        self.name     = name
        self.password = password
```

Результат будет таким же: `id` и `name` попадут в JSON, `password` будет скрыт.

## Классы без конструктора

Если у класса нет собственного `__init__`, `@serializable` сгенерирует его по аннотациям на уровне класса. Это удобно для простых response-моделей.

```python
@serializable
class UserResponse:
    id: Public[int]
    name: Public[str]
    age: Public[int] = 18
    password_hash: Private[str] = 'hidden'
```

Теперь объект можно создать через keyword arguments.

```python
user = UserResponse(
    id = 1,
    name = 'Dima'
)
```

Autumn применит дефолтные значения, потребует обязательные поля и отклонит неизвестные аргументы. `Private`-поля участвуют в создании объекта, но не попадают в JSON.

```json
{
    "id": 1,
    "name": "Dima",
    "age": 18
}
```

Если у класса уже есть свой `__init__`, Autumn его не меняет.

## Списки и вложенные структуры

`@serializable`-объекты можно возвращать не только отдельно, но и внутри списков и словарей.

```python
@get
async def list_users(self):
    return {
        'items': [
            User('Dima', 18, 'secret'),
            User('Alex', 20, 'secret')
        ]
    }
```

Autumn передаст такие объекты в `JSONResponse`, а сериализатор преобразует их в JSON-совместимые словари.

## Отличие от Pydantic

Pydantic-модель лучше подходит для входных данных и строгой валидации.

```python
from pydantic import BaseModel, Field

class UserSchema(BaseModel):
    name: str = Field(..., min_length = 4)
    age: int
```

`@serializable` лучше подходит для выходных доменных объектов, когда нужна простая настройка видимости полей.

```python
@serializable
class User:
    def __init__(self, name, password):
        self.name:     Public[str]  = name
        self.password: Private[str] = password
```

Оба варианта можно возвращать из контроллеров: Autumn автоматически сериализует и Pydantic-модели, и `@serializable`-объекты.

## Безопасное разрешение аннотаций

Autumn разбирает аннотации `@serializable` ограниченным синтаксическим парсером и не исполняет их текст. Поддерживаются имена, публичные атрибуты модулей и типов, generics, кортежи, списки, константы и объединения через `|`. Вызовы, lambda, comprehensions, приватные и dunder-атрибуты отклоняются и трактуются как `Any`; поля `Private[...]` при этом остаются приватными.

Аннотации должны оставаться декларативными: выражения с побочными эффектами не нужны и не выполняются.
