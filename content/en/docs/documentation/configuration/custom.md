---
title: Application Settings
description: Gather files and environment values into calm autumn configuration.
---

Custom configuration in Autumn is described by a class that inherits from `Configuration`. Class fields become settings, and data sources are connected with `source.json`, `source.yaml`, or `source.env`.

```python
from autumn.configuration import Configuration, Maple, source

@source.json('./configuration/application.json')
class ApplicationConfiguration(Configuration):
    database_host: Maple['database.host', str]
    database_port: Maple['database.port', int] = 5432
```

When the application starts, Autumn collects registered configurations, calls `build()`, and puts ready objects into the DI container. Configuration can then be accepted as a regular dependency.

```python
from autumn import leaf

@leaf
async def database(configuration: ApplicationConfiguration) -> DBClient:
    return DBClient(
        host = configuration.database_host,
        port = configuration.database_port
    )
```

## Configuration Sources

Autumn supports several sources:

```python
source.json('./config.json')
source.yaml('./config.yaml')
source.env(prefix = 'APP_')
```

A source is declared with a decorator above the class.

```python
@source.json('./configuration/settings.json')
class Settings(Configuration):
    name: str = 'Autumn'
```

If `source.json` or `source.yaml` receives a path without extension, Autumn tries to find a file with the matching extension.

```python
@source.json('./settings')  # looks for ./settings.json
class Settings(Configuration):
    ...

@source.yaml('./settings')  # looks for ./settings.yaml or ./settings.yml
class Settings(Configuration):
    ...
```

## Maple

`Maple` connects a class field to a path inside the source.

```python
class ApplicationConfiguration(Configuration):
    name: Maple['application.name', str]
```

The path is separated with dots. If the path includes a list, the index is written as part of the path.

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

For this JSON:

```python
port: Maple['application.ports.0', int]
```

the value is:

```python
8000
```

## Default Values

If a value is not found in sources but the field has a default, Autumn uses the default.

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

If there is no default and the value is missing, Autumn raises a configuration error.

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

## Fields Without Maple

A field without `Maple` must have a default value.

```python
class ApplicationConfiguration(Configuration):
    name: str = 'Autumn Web Application'
```

Without `Maple` and without a default, Autumn cannot build the field.

## Type Casting

Autumn casts source values to the field type.

```python
class ApplicationConfiguration(Configuration):
    port:  Maple['server.port',   int] = 8000
    debug: Maple['server.debug', bool] = False
```

Supported basic types:

- `str`
- `int`
- `float`
- `bool`
- `UUID`
- `list[...]`
- `dict[..., ...]`
- `Optional[...]`

For `bool`, strings like `true`, `yes`, `on`, and `1` are treated as `True`; `false`, `no`, `off`, and `0` are treated as `False`.

## Multiple Sources

One class can have several sources.

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

If a value exists in several sources, Autumn takes the value from the source that is higher in the reading chain. This lets environment variables override file settings.

In this example, `name` is `Autumn Web Application`, because `Progressive Autumn Application` comes from the JSON config, which is lower in the chain than the `.env` file.

## Usage Through DI

Configuration is automatically registered as a singleton dependency.

```python
@service
class UserService:
    def __init__(self, configuration: ApplicationConfiguration):
        self.configuration = configuration
```

The service receives an already built `ApplicationConfiguration` object.
