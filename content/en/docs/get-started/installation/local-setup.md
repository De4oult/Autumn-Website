---
title: Local Setup
description: Python, a virtual environment, and the first package installation.
---

Autumn feels best in a clean Python environment. The idea is simple: one project, one environment, and no hidden machine state.

## What You'll Need
- Python 3.12 or newer
- `pip` available in your terminal
- A dedicated virtual environment for each project

Choose whichever workflow fits your team best. `venv` is simpler and closer to the standard Python approach, while `pipenv` is convenient if you want to keep the environment and dependencies together.

::documentation-code
@tab venv [bash]

```bash
python -m venv .venv
source .venv/bin/activate

pip install autumn-framework uvicorn
```

@tab pipenv [bash]

```bash
pip install pipenv
pipenv --python 3.12

pipenv install autumn-framework uvicorn
pipenv shell
```
::

## Recommended Starter Structure

```text
app/
    controllers/
    services/
app.py
```

The structure is intentionally small. Start with folders organized by responsibility, then let the project grow around that shape.
