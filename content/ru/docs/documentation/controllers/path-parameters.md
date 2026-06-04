---
title: Path-параметры
description: Достаньте значения прямо из пути, как ориентиры на осенней тропе.
---

Path-параметры позволяют получать значения прямо из URL. В Autumn они объявляются внутри маршрута в фигурных скобках:

```python
from autumn.controller import REST, get

@REST(prefix = '/users')
class UserController:
    @get('/{name:str}')
    async def get_user(self, name: str):
        return { 'name' : name }
```

Маршрут:
```http
GET /users/dima
```

В метод будет передано:
```python
name == 'dima'
```

Имя параметра в пути должно совпадать с именем аргумента метода.

## Типы path-параметров

Синтаксис параметра:

```text
{name:type}
```

Если тип не указан, используется `str`.

Поддерживаемые типы:

| Тип     | Python-тип | Что принимает             |
| ---     | ---        | ---                       |
| `str`   | `str`      | один сегмент пути без `/` |
| `int`   | `int`      | целое число               |
| `float` | `float`    | число с десятичной точкой |
| `uuid`  | `UUID`     | UUID-строку               |
| `path`  | `str`      | остаток пути, включая `/` |

Пример с числовым идентификатором:

```python
@REST(prefix = '/users')
class UserController:
    @get('/{id:int}')
    async def get_user(self, id: int):
        return { 'id' : id }
```

```http
GET /users/42
```

Внутри метода `id` уже будет числом `int`, а не строкой.

## Несколько параметров

Параметры можно комбинировать с обычными сегментами пути.

```python
@REST(prefix = '/users')
class UserController:
    @get('/{user_id:int}/posts/{post_id:int}')
    async def get_post(self, user_id: int, post_id: int):
        return {
            'user_id': user_id,
            'post_id': post_id
        }
```

```http
GET /users/10/posts/25
```

## Path-параметр для остатка пути

Тип `path` нужен, когда параметр должен захватить не один сегмент, а весь оставшийся путь.

```python
@REST(prefix = '/users')
class UserController:
    @get('/files/{file:path}')
    async def fs_file(self, file: str):
        return { 'file' : file }
```

```http
GET /users/files/images/avatar.png
```

В метод придет:

```python
file == 'images/avatar.png'
```

Важно: параметр с типом `path` должен быть последним сегментом маршрута.

```python
# Так нельзя
@get('/files/{file:path}/meta')
async def broken(self, file: str):
    ...
```

## Если значение не подходит под тип

Если URL не соответствует типу параметра, маршрут не будет считаться совпавшим.

Например, такой маршрут:

```python
@get('/{id:int}')
async def get_user(self, id: int):
    ...
```

совпадет с `/users/123`, но не совпадет с `/users/alex`.
