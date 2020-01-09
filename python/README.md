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
    dk = await Dashblock.connect("ws://beta.dashblock.com", [YOU_API_KEY])
    await dk.goto("https://www.google.com", 5000)
    var content = await dk.html()
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