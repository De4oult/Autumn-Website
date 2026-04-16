---
title: Внедрение сервиса
description: Внедряйте сервис в контроллер вместо ручной сборки объектов.
---

Autumn использует явное объявление зависимостей через конструктор.  
Если контроллеру требуется сервис, достаточно указать его в `__init__` — контейнер автоматически передаст нужный экземпляр.

## Контроллер + сервис


::documentation-code
@tab controller/hello.py [python]

```python
from autumn.controller import REST, get
from autumn.response import JSONResponse

@REST(prefix = '/hello')
class HelloController:
    def __init__(self, service: GreetingService):
        self.service = service

    @get('/')
    async def index(self) -> JSONResponse:
        return JSONResponse({
            'message' : self.service.build_message()
        })
```

@tab services/greeting.py [python]

```python
from autumn import service

@service
class GreetingService:
    def build_message(self) -> str:
        return 'Hello from the service layer'
```
::

## Что это даёт
- Зависимости явно описаны в конструкторе
- Контроллер не отвечает за создание сервисов
- DI-контейнер управляет жизненным циклом объектов

Это и есть подход Autumn: зависимости остаются явными, а связывание компонентов выполняется автоматически.