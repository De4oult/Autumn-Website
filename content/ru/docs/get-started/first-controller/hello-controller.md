---
title: Hello-контроллер
description: Добавьте контроллер с одним маршрутом и JSON-ответом.
---

Контроллеры в Autumn выступают в роли транспортного слоя. Они принимают HTTP-запросы, делегируют выполнение бизнес-логики соответствующим сервисам и формируют HTTP-ответ.

## Первый маршрут

```python
from autumn.controller import get
from autumn.response import JSONResponse

from app import app

@app.rest(prefix = '/hello')
class HelloController:
    @get('/')
    async def index(self) -> JSONResponse:
        return JSONResponse({
            'message': 'Hello from Autumn'
        })
```

## Ключевые моменты
- `@REST(...)` группирует маршруты в рамках одного контроллера и задаёт общий префикс.
- `@get('/')` определяет HTTP-метод и путь для обработчика.
- `JSONResponse` отвечает за сериализацию `dict` в `JSON` и формирует корректный HTTP-ответ с необходимыми заголовками.