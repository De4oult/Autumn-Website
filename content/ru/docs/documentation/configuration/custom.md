---
title: Настройки приложения
description: Соберите настройки из файлов и окружения в спокойную осеннюю конфигурацию.
---

Пользовательская конфигурация в Autumn описывается классом, который наследуется от `Configuration`. Поля класса становятся настройками, а источники данных подключаются декораторами `source.json`, `source.yaml` или `source.env`.

```python
from autumn.configuration import Configuration, Maple, source

@source.json('./configuration/application.json')
class ApplicationConfiguration(Configuration):
    database_host: Maple['database.host', str]
    database_port: Maple['database.port', int] = 5432
```

Когда приложение стартует, Autumn собирает зарегистрированные конфигурации, вызывает `build()` и кладет готовые объекты в DI-контейнер. Поэтому конфигурацию можно принимать как обычную зависимость.

```python
from autumn import leaf

@leaf
async def database(configuration: ApplicationConfiguration) -> DBClient:
    return DBClient(
        host = configuration.database_host,
        port = configuration.database_port
    )
```

## Источники конфигурации

Autumn поддерживает несколько источников:

```python
source.json('./config.json')
source.yaml('./config.yaml')
source.env(prefix = 'APP_')
```

Источник указывается декоратором над классом.

```python
@source.json('./configuration/settings.json')
class Settings(Configuration):
    name: str = 'Autumn'
```

Если у `source.json` или `source.yaml` путь указан без расширения, Autumn попробует найти файл с подходящим расширением.

```python
@source.json('./settings')  # ищет ./settings.json
class Settings(Configuration):
    ...

@source.yaml('./settings')  # ищет ./settings.yaml или ./settings.yml
class Settings(Configuration):
    ...
```

## Maple

`Maple` связывает поле класса с путем внутри источника.

```python
class ApplicationConfiguration(Configuration):
    name: Maple['application.name', str]
```

Путь разделяется точками. Если в пути встречается список, индекс пишется как часть пути.

```json
{
    "application": {
        "ports": [
            8000,
            3000
        ]
    }
}
```

Для такого JSON:

```python
port: Maple['application.ports.0', int]
```

значение будет:

```python
8000
```

## Значения по умолчанию

Если значение не найдено в источниках, но у поля есть default, Autumn использует default.

::documentation-code
@tab configuration/application.py [python]
```python
@source.json('./config.json')
class ApplicationConfiguration(Configuration):
    port: Maple['application.port', int] = 8000
```

@tab config.json [json]
```json
{
    "application" : {
        "name" : "Autumn Web Application"
    }
}
```
::

Если default нет и значение не найдено, Autumn выбросит ошибку конфигурации.

::documentation-code
@tab configuration/application.py [python]
```python
class ApplicationConfiguration(Configuration):
    port: Maple['application.port', int]
```

@tab config.json [json]
```json
{
    "application" : {
        "name" : "Autumn Web Application"
    }
}
```
::

## Поля без Maple

Поле без `Maple` должно иметь значение по умолчанию.

```python
class ApplicationConfiguration(Configuration):
    name: str = 'Autumn Web Application'
```

Если у поля нет ни `Maple`, ни default, Autumn не сможет его собрать.

## Приведение типов

Autumn приводит значения из источника к типу поля.

```python
class ApplicationConfiguration(Configuration):
    port:  Maple['server.port',   int] = 8000
    debug: Maple['server.debug', bool] = False
```

Поддерживаются базовые типы:

- `str`
- `int`
- `float`
- `bool`
- `UUID`
- `list[...]`
- `dict[..., ...]`
- `Optional[...]`

Для `bool` строки вроде `true`, `yes`, `on`, `1` считаются `True`, а `false`, `no`, `off`, `0` - `False`.

## Несколько источников

На один класс можно повесить несколько источников.

::documentation-code
@tab configuration/application.py [python]
```python
@source.env(prefix = 'APP_')
@source.json('./config.json')
class ApplicationConfiguration(Configuration):
    name: Maple['application.name', str]
```

@tab .env [env]
```
APP_NAME=Autumn Web Application
```

@tab config.json [json]
```json
{
    "application" : {
        "name" : "Progressive Autumn Application"
    }
}
```
::

Если значение есть в нескольких источниках, Autumn берет значение из источника, который стоит выше по цепочке при чтении. Это позволяет переопределять файловые настройки переменными окружения.

В приведенном выше примере значением переменной `name` будет `Autumn Web Application`, т.к. `Progressive Autumn Application` указан в json-конфиге, который в цепи чтения стоит ниже, чем .env-файл.  

## Использование через DI

Конфигурация автоматически регистрируется как singleton-зависимость.

```python
@service
class UserService:
    def __init__(self, configuration: ApplicationConfiguration):
        self.configuration = configuration
```

Такой сервис получит уже собранный объект `ApplicationConfiguration`.
