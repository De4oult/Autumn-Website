---
title: Resources
description: Keep application files, structured data, and static responses behind one safe resource root.
---

`Resources` is a small singleton object for working with files that belong to your application.

Use it when you want a single explicit root for HTML files, public assets, localization files, JSON/YAML data, or safe file responses.

```python
from autumn.resources import Resources

assets = Resources('resources/public')
```

Creating `Resources` with the same root returns the same object, so it is safe to reuse in configuration, services, and controllers.

## Reading Files

```python
from autumn.resources import Resources, ResourceType

resources = Resources('resources')

html = resources.read('pages/index.html')
logo = resources.read('public/logo.png', ResourceType.BYTES)
settings = resources.read('settings.json', ResourceType.DATA)
```

`read(...)` uses `ResourceType.TEXT` by default.

`ResourceType.DATA` supports:

- `.json`
- `.yaml`
- `.yml`

YAML resources require `PyYAML`, which is included in Autumn's package dependencies.

## Safe File Responses

Use `response(...)` when a route should return a file from a resource root.

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

The file path is resolved inside the configured resource root. If a path tries to escape that root, Autumn rejects it.

## Streaming Large Files

Use `stream(...)` for large files.

```python
@get('/video')
async def video(self):
    return public.stream('intro.mp4')
```

This keeps the same root safety, but returns a streaming response instead of loading the whole file into memory.

## Finding Data Files

`find(...)` looks for the first supported data file with the given stem.

```python
locales = Resources('resources/locales')

file = locales.find('en')
```

This checks `en.json`, `en.yaml`, and `en.yml` in that order. Autumn uses the same mechanism for localization.
