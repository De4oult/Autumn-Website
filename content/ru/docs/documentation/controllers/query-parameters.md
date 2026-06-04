---
title: Query-параметры
description: Собирайте значения из URL аккуратно, как осенние листья в корзину.
---

Query-параметры передаются после `?` в URL:

```http
GET /users?page=2
```

В Autumn их можно читать через `request.query` или объявлять явно через декораторы `query`.

## Чтение через Request

Самый простой способ - принять `Request` и обратиться к `request.query`.

```python
from autumn import Request
from autumn.controller import REST, get

@REST(prefix = '/users')
class UserController:
    @get
    async def search(self, request: Request):
        return {
            'page' : request.query.page
        }
```

Для запроса:

```http
GET /users?page=2
```

значение будет доступно как:

```python
request.query.page == '2'
```

При таком чтении значения остаются строками, потому что они приходят из URL.

## Типизированные query-параметры

Чтобы Autumn сам извлек и привел query-параметр к нужному типу, используй `query` из `autumn.request`.

```python
from autumn.request import query
from autumn.controller import REST, get
from autumn.response import JSONResponse

@REST(prefix = '/users')
class UserController:
    @get
    @query.int('page', default = 1)
    async def search(self, page: int):
        return JSONResponse({ 'page' : page })
```

Запрос:

```http
GET /users?page=3
```

В метод попадет:

```python
page == 3
```

Если параметр не передан, будет использовано значение по умолчанию:

```python
page == 1
```

## Поддерживаемые типы

Доступные декораторы:

```python
query.string()
query.int()
query.float()
query.uuid()
```

Пример:

```python
@REST(prefix = '/products')
class ProductController:
    @get
    @query.string('search')
    @query.float('min_price')
    async def list_products(self, search: str, min_price: float):
        return {
            'search'    : search,
            'min_price' : min_price
        }
```

```http
GET /products?search=phone&min_price=199.99
```

## Обязательные параметры

По умолчанию query-параметр не обязательный. Если он не передан и у него нет `default`, в метод попадет `None`.

Чтобы сделать параметр обязательным, укажи `required = True`.

```python
@REST(prefix = '/users')
class UserController:
    @get('/search')
    @query.string('name', required = True)
    async def search_by_name(self, name: str):
        return { 'name' : name }
```

Если вызвать маршрут без `name`:

```http
GET /users/search
```

Autumn вернет ошибку `400` с сообщением о пропущенном query-параметре.

## Default и required

Параметр не может одновременно быть обязательным и иметь значение по умолчанию.

```python
# Так нельзя
@query.int('page', required = True, default = 1)
```

Если значение по умолчанию есть, параметр уже можно не передавать в URL.

## Ошибка приведения типа

Если значение нельзя привести к указанному типу, Autumn вернет `400`.

```python
@get
@query.int('page')
async def search(self, page: int):
    return { 'page': page }
```

Такой запрос корректный:

```http
GET /users?page=5
```

А такой приведет к ошибке:

```http
GET /users?page=abc
```
