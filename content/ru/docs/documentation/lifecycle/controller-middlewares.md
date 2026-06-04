---
title: Middleware контроллера
description: Добавьте общую обработку для всех маршрутов одного контроллера.
---

Middleware контроллера объявляется внутри класса `@REST` и применяется ко всем маршрутам этого контроллера.

Используется тот же декоратор `@middleware`, что и для глобальных middleware. Разница в месте объявления: если декоратор стоит на методе класса, Autumn помечает его как middleware контроллера.

```python
from autumn import middleware
from autumn.controller import REST, get

@REST(prefix = '/users')
class UserController:
    @middleware
    def trace(self):
        print('before')

        response = yield
        response.headers['X-Trace'] = '1'

        print(f'after {response.status}')

    @get('/{name:str}')
    async def get_name(self, name: str):
        return { 'name' : name }
```

Такой middleware выполнится вокруг каждого обработчика маршрута внутри `UserController`.

## Around middleware

`@middleware` без уточнения - это around middleware. Он должен быть generator-функцией и сделать ровно один `yield`.

```python
@middleware
def trace(self):
    print('before')

    response = yield

    response.headers['X-Trace'] = '1'

    print('after')
```

Код до `yield` выполняется перед методом контроллера. После `yield` middleware получает response.

К этому моменту Autumn уже нормализует результат обработчика в `Response`. Поэтому middleware может безопасно менять `response.headers`, даже если сам обработчик вернул `dict`, Pydantic-модель или `@serializable`-объект.

Если generator не сделает `yield` или сделает больше одного `yield`, Autumn выбросит ошибку.

## Before middleware контроллера

`@middleware.before` выполняется перед методом контроллера.

```python
@REST(prefix = '/users')
class UserController:
    @middleware.before
    def check(self):
        print('before controller method')
```

Такой middleware не обязан возвращать response. Он подходит для действий перед вызовом обработчика:
- проверка состояния;
- логирование;
- подготовка данных;
- вызов зависимостей.

## After middleware контроллера

`@middleware.after` выполняется после метода контроллера и получает response.

```python
@REST(prefix = '/users')
class UserController:
    @middleware.after
    def stamp(self, response) -> None:
        response.headers['X-Controller'] = 'users'
```

Если `after` middleware вернет объект `Response`, Autumn заменит исходный response на него. Если вернет `None`, будет использован текущий response.

```python
from autumn.response import JSONResponse

@middleware.after
def replace_response(self, response):
    if response.status == 204:
        return JSONResponse({ 'empty': True })
```

## Доступ к request и path-параметрам

Middleware контроллера может принимать те же данные, которые Autumn умеет передать методу: `request` и path-параметры.

```python
from autumn import Request

@REST(prefix = '/users')
class UserController:
    @middleware.before
    def log_user(self, request: Request, name: str):
        print(request.path, name)

    @get('/{name:str}')
    async def get_user(self, name: str):
        return { 'name': name }
```

Autumn передаст path-параметр `name`, если текущий маршрут его содержит.

## Зависимости в middleware

Так как middleware контроллера вызывается через контейнер, в него можно добавлять зависимости через type hints.

```python
@REST(prefix = '/users')
class UserController:
    @middleware.before
    def log_with_service(self, users: UserService):
        ...
```

Это работает так же, как injection в методах контроллера.

## Порядок выполнения

Для контроллера порядок такой:

```text
around: код до yield
before middleware
метод контроллера
after middleware
around: код после yield
```

Если around middleware несколько, они входят в порядке объявления, а выходят в обратном порядке.

```python
@middleware
def first(self):
    print('first before')

    response = yield

    print('first after')

@middleware
def second(self):
    print('second before')

    response = yield

    print('second after')
```

Порядок будет таким:

```text
first before
second before
метод контроллера
second after
first after
```

## Когда использовать controller middleware

Middleware контроллера удобно, когда логика относится ко всем обработчикам одного контроллера:
- общий trace-заголовок;
- проверка прав для группы маршрутов;
- логирование действий контроллера;
- подготовка контекста;
- единая обработка response.

Если логика нужна всему приложению, используй глобальный `@middleware`. Если только одному обработчику - route middleware с `path` и `method`.
