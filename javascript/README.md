# Javascript SDK

## Table of Contents
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Methods](#methods)

## Installation
```shell
npm install @dashblock/sdk
```

```javascript
var Dashblock = require("@dashblock/sdk").Dashblock
//or
import { Dashblock } from "@dashblock/sdk"
```

## Getting started

```javascript
var Dashblock = require("@dashblock/sdk").Dashblock

//Create an account on beta.dashblock.io to get an API Key
var dk = await Dashblock.connect("wss://beta.dashblock.com", { api_key: YOU_API_KEY })
await dk.goto("https://www.google.com")
var content = await dk.html()
console.log(content)
await dk.close()
```

## Methods
- goto
- html

(Coming soon)
- click
- input
- collect