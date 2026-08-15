---
title: Resources
description: Храните файлы приложения, структурированные данные и file responses за одним безопасным корнем ресурсов.
---

`Resources` — небольшой singleton-объект для работы с файлами, которые принадлежат приложению.

Используй его, когда нужен один явный корень для HTML-файлов, публичных ассетов, локализаций, JSON/YAML-данных или безопасной отдачи файлов.

```python
from autumn.resources import Resources

assets = Resources('resources/public')
```

Если создать `Resources` с тем же root ещё раз, Autumn вернёт тот же объект. Его можно спокойно переиспользовать в конфигурации, сервисах и контроллерах.

## Чтение файлов

```python
from autumn.resources import Resources, ResourceType

resources = Resources('resources')

html = resources.read('pages/index.html')
logo = resources.read('public/logo.png', ResourceType.BYTES)
settings = resources.read('settings.json', ResourceType.DATA)
```

`read(...)` по умолчанию использует `ResourceType.TEXT`.

`ResourceType.DATA` поддерживает:

- `.json`
- `.yaml`
- `.yml`

Для YAML используется `PyYAML`; зависимость входит в пакет Autumn.

## Безопасная отдача файлов

Используй `response(...)`, когда route должен вернуть файл из корня ресурсов.

```python
from autumn.controller import REST, get
from autumn.resources import Resources

public = Resources('resources/public')

@REST(prefix = '/files')
class FileController:
    @get('/logo')
    async def logo(self):
        return public.response('logo.png')
```

Путь разрешается внутри заданного root. Если путь пытается выйти наружу, Autumn отклонит такой запрос.

## Streaming больших файлов

Для больших файлов используй `stream(...)`.

```python
@get('/video')
async def video(self):
    return public.stream('intro.mp4')
```

Так сохраняется та же защита root, но ответ отдаётся потоково и не требует загружать весь файл в память.

## Поиск data-файлов

`find(...)` ищет первый поддерживаемый файл с указанным stem.

```python
locales = Resources('resources/locales')

file = locales.find('en')
```

Autumn проверит `en.json`, `en.yaml` и `en.yml` в таком порядке. Этот же механизм используется для локализации.
