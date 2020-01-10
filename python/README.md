# Python SDK

## Table of Contents
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Methods](#methods)

```shell
pip install dashblock
```

## Getting started

```python
from dashblock import Dashblock
import asyncio

async def main():
    # You can get an API Key on beta.dashblock.com
    dk = await Dashblock.connect(api_key=YOU_API_KEY)
    await dk.goto("https://www.google.com", timeout=5000)
    content = await dk.html()
    print(content)
    await dk.close()

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(main())
```

## Methods
- goto
- html

(Coming soon)
- click
- input
- collect