---
title: @only
description: Ограничивайте регистрацию контроллеров, сервисов и зависимостей определёнными окружениями.
---

Декоратор `@only(...)` позволяет указать, в каких окружениях должен быть доступен компонент.

Он может применяться к контроллерам, сервисам, leaf-функциям, middleware, hooks и другим регистрируемым объектам.

```python
from autumn import only, Environment, service

@only(Environment.LOCAL, Environment.DEVELOPMENT)
@service
class MockPaymentService:
    ...
```

В этом примере `MockPaymentService` будет зарегистрирован только в окружениях `LOCAL` и `DEVELOPMENT`.

Если приложение запущено в другом окружении, компонент будет проигнорирован.

## Поддерживаемые значения

В `@only(...)` можно передавать как значения перечисления `Environment`, так и строки.

::documentation-code
@tab Enum [python]
```python
@only(Environment.DEVELOPMENT)
@service
class DebugService:
    ...
```

@tab string [python]
```python
@only('development')
@service
class DebugService:
    ...
```
::

Рекомендуется использовать `Environment`, поскольку такой вариант безопаснее и позволяет избежать ошибок в названии окружения.

## Ограничение контроллеров

Если контроллер не разрешён для текущего окружения, Autumn не будет его регистрировать.

```python
from autumn import REST, only, Environment

@only(Environment.DEVELOPMENT)
@REST(prefix = '/debug')
class DebugController:
    ...
```

При запуске в `PRODUCTION`:
* контроллер не будет зарегистрирован;
* маршруты не попадут в роутер;
* endpoints не попадут в OpenAPI-документацию;
* зависимости контроллера не будут разрешаться.

Это удобно для отладочных маршрутов, тестовых API и внутренних инструментов.

## Ограничение сервисов и leaf-функций

Декоратор можно использовать для зависимостей.

```python
@only(Environment.LOCAL)
@service
class MockMailService:
    ...
```

```python
@only(Environment.DEVELOPMENT)
@leaf
async def mock_payment_gateway() -> PaymentGateway:
    ...
```

Если окружение не соответствует списку разрешённых, провайдер не будет зарегистрирован в DI-контейнере.

## Реализации под разные окружения

Когда разные реализации включены в разных окружениях, используй union type в сигнатуре зависимости.

```python
from autumn import Environment, only, service

@only(Environment.DEVELOPMENT)
@service
class MockGateway:
    def name(self) -> str:
        return 'mock'

@only(Environment.PRODUCTION)
@service
class LiveGateway:
    def name(self) -> str:
        return 'live'

@service
class CheckoutService:
    def __init__(self, gateway: MockGateway | LiveGateway):
        self.gateway = gateway
```

Autumn выберет зависимость, у которой `@only(...)` соответствует текущему окружению приложения.

Если приложение запущено в `DEVELOPMENT`, будет внедрён `MockGateway`. Если в `PRODUCTION` — `LiveGateway`.

Окружения у вариантов не должны пересекаться. Такой пример неоднозначен:

```python
@only(Environment.DEVELOPMENT)
@service
class FirstGateway:
    ...

@only(Environment.DEVELOPMENT, Environment.LOCAL)
@service
class SecondGateway:
    ...
```

Для `FirstGateway | SecondGateway` Autumn остановит запуск во время проверки зависимостей, потому что обе реализации доступны в `DEVELOPMENT`.

## Проверка зависимостей

Autumn проверяет граф зависимостей во время запуска приложения.

Если активный компонент зависит от провайдера, который отключён для текущего окружения, приложение завершит запуск с ошибкой.

```python
@only(Environment.DEVELOPMENT)
@service
class MockGateway:
    ...

@service
class PaymentService:
    def __init__(self, gateway: MockGateway):
        self.gateway = gateway
```

Если приложение запускается в `PRODUCTION`, Autumn обнаружит, что `PaymentService` требует зависимость, недоступную в этом окружении, и остановит запуск.

Такое поведение помогает обнаруживать ошибки конфигурации до начала обработки запросов.

Autumn также проверяет графы зависимостей для других окружений и печатает warning, если текущее окружение может стартовать, но в другом окружении граф сломается.

```python
@only(Environment.LOCAL)
@service
class LocalGateway:
    ...

@only(Environment.PRODUCTION)
@service
class ProductionCheckoutService:
    def __init__(self, gateway: LocalGateway):
        self.gateway = gateway
```

Если приложение запущено в `LOCAL`, оно сможет стартовать, потому что `ProductionCheckoutService` не активен. Но Autumn предупредит, что в `PRODUCTION` граф зависимостей упадёт, потому что `LocalGateway` там недоступен.

## Что происходит при несовпадении окружения

Для компонентов, помеченных через `@only(...)`, применяется следующая логика:
| Тип компонента | Поведение                              |
| -------------- | -------------------------------------- |
| Controller     | Исключается из маршрутизации и OpenAPI |
| Service        | Не регистрируется в DI-контейнере      |
| Leaf           | Не регистрируется в DI-контейнере      |
| Middleware     | Не подключается к приложению           |
| Hook           | Не регистрируется                      |
| Configuration  | Не участвует в создании контейнера     |

Если отключённый компонент нигде не используется, приложение продолжит работу.

Если от него зависит активная цепочка компонентов, запуск будет остановлен с ошибкой проверки зависимостей.

## Когда использовать @only

Декоратор особенно полезен для:
* моков и тестовых реализаций сервисов;
* отладочных контроллеров;
* локальных инструментов разработки;
* внутренних административных endpoints;
* интеграций, доступных только в определённых окружениях;
* middleware и hooks, которые не должны работать на production.

Обычно `@only(...)` используют для разделения production- и development-реализаций без необходимости менять код приложения вручную.
