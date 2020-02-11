# Javascript SDK

## Table of Contents
1. [Getting Started](#getting-started)
2. [API](#api)
    - Dashblock.connect(options: `object`)
    - dk.set({ device: `string`, proxy: `string` })
    - dk.goto(url: `string`, options: `object`)
    - dk.html()
    - dk.collect(schema: `Schema`)
    - dk.click(selection: `Selection`)
    - dk.clickAll(selection: `Selection`)
    - dk.input(selection: `Selection`, value: `string`)
    - dk.submit()
    - dk.describe()
    - dk.sleep()
    - dk.close()

---

## 1. Getting Started

How to install it ?

```shell
npm install @dashblock/sdk
```

How to use it ?

```javascript
var Dashblock = require("@dashblock/sdk").Dashblock

var main = async function() {
    //Create an account on beta.dashblock.com to get an API Key
    var dk = await Dashblock.connect({ api_key: YOU_API_KEY })
    await dk.goto("https://www.google.com")
    var content = await dk.html()
    console.log(content)
    await dk.close()
}

main()
```

---

## 2. API
### __**Dashblock.connect(options)**__
##### Parameters
- options: `Object`
    - api_key: `string` API Key to authenticate the session. You can find yours here: https://beta.dashblock.com
    - endpoint: `string` (Optional) Endpoint to connect to (default to wss://beta.dashblock.com)
    - log_level: `string` (Optional) Display logs of communication with browser. Allowed values: "off", "error", "info", "debug"

##### Return object
- `Promise<DashblockInstance>`

##### Sample
```javascript
var dk = await Dashblock.connect({
    api_key: YOU_API_KEY,
    log_level: 'debug'
})
```
### __**dk.set({ device: `string`, proxy: `string`})**__
##### Parameters
- device: `string`. Allowed values are `mobile` and `desktop`. The browser will emulate the device dimension and user-agent.
- proxy: `string`. Allowed values are `none` and `datacenter`. You can use a proxy on the browser to change the default IP addresses.

##### Return object
- `Promise<void>`

### __**dk.goto(url, options)**__
##### Parameters
- url: `string` Goto a specific URL and wait for the page to stabilize.
- options: `Object` (Optional).
    - timeout: `string` Wait up to timeout milliseconds before continuing.

##### Return object
- `Promise<void>`

### **dk.html()**
Return the html of the page.

##### Return
- `Promise<string>`

### **dk.collect(schema: `Schema`)**
Collect and structure automatically data on a given page.

##### Parameters
- `Schema`: `SchemaItem[]`
- `SchemaItem`:
    - name: `string`. Define the name of the information
    - format: `string`. (optional, default to STRING) Allowed values are `NUMBER`, `DATE`, `DATE_RANGE`, `URL`, `STRING`, `BOOLEAN`, `CURRENCY`, `ARRAY<NUMBER>`, `ARRAY<DATE>`, `ARRAY<CURRENCY>`. Defaults to `STRING`. This parameter allows you to turn natural language information into a machine readable format.
    - value: `Object`. (optional, default to content: -1) Define where to get the value
        - style: `string`. Get the css property of an elements, must be mapped to camel case (background-image => backgroundImage). Accepted values: backgroundImage.
        - attribute: `string`. Get the attribute from the html tag (href, src...)
        - content: `number`. Depth of text content. 0 will only retrieve direct textNodes of the elements and -1 all descendants textNodes of this element.
    - selection: `Selection`
    - schema: `Schema` (optional). You can create nested entities by providing a schema for this field

- `Selection`: If you provide both fields, you will get the intersection of the selections.
    - css: `string`. Identify one or more elements on a page. The provided selector(s) need to match all the elements you want to extract.
    - content: `string`. Identify elements based on their content. If css and content are provided, only elements matching both will be selected.

##### Return object
- `Promise<Object[]>`. Where object follows the defined schema

##### Sample
```javascript
    await dk.goto("https://news.ycombinator.com/")
    var results = await dk.collect([{
                        name: 'title',
                        selection: {
                            css: 'td.title > a.storylink'
                        }
                    }, 
                    {
                        name: 'link',
                        value: {
                            attribute: 'href'
                        },
                        selection: {
                            css: 'td.title > a.storylink'
                        }
                    },
                    {
                        name: 'points',
                        format: 'NUMBER',
                        selection: {
                            css: 'span.score'
                        }
                    }, 
                    {
                        name: 'username',
                        selection: {
                            css: 'td.subtext > a.hnuser'
                        }
                    },
                    {
                        name: 'posted_ts',
                        format: 'DATE',
                        selection: {
                            css: 'span.age > a'
                        }
                    },
                    {
                        name: 'comments',
                        format: 'NUMBER',
                        selection: {
                            css: 'td.subtext > a:nth-child(6)'
                        }
                    }])

// Results will look like :
// [ { title:
//      'An ant colony has memories its individual members don’t have (2019)',
//     link:
//      'https://aeon.co/ideas/an-ant-colony-has-memories-that-its-individual-members-dont-have',
//     points: 177,
//     username: 'maxbaines',
//     posted_ts: '2020-01-16 08:24:06',
//     comments: 58 },
//   { title: 'Why Amsterdam’s Canal Houses Have Endured for 300 Years',
//     link:
//      'https://www.citylab.com/design/2020/01/amsterdam-architecture-history-canal-houses-urban-design/604921/',
//     points: 9,
//     username: 'pseudolus',
//     posted_ts: '2020-01-16 11:58:06',
// ....
```

### **dk.click(selection: Selection)**
Click on the element matching the selection. Throw an error if there is more than one.

##### Parameters
- `Selection`:
    - css: `string`. Identify one or more elements on a page.
    - content: `string`. Identify elements based on their content. If css and content are provided, only elements matching both will be selected.

##### Return object
- `Promise<void>`. Where object follows the defined schema

### **dk.clickAll(selection: Selection)**
Click on all elements matching the selection

##### Parameters
- `Selection`:
    - css: `string`. Identify one or more elements on a page.
    - content: `string`. Identify elements based on their content. If css and content are provided, only elements matching both will be selected.

##### Return object
- `Promise<void>`

### **dk.input(selection: Selection, value: `string`)**
Input data on the given selected input element

##### Parameters
- `Selection`:
    - css: `string`. Identify one or more elements on a page.
    - content: `string`. Identify elements based on their content. If css and content are provided, only elements matching both will be selected.

##### Return object
- `Promise<void>`

### **dk.submit()**
Press enter key (useful to submit form after input action)

##### Return object
- `Promise<void>`.

### **dk.describe()**
Send a description of the page (url, title, description, author, favicon, links...)

##### Return object
- `Promise<PageDescription>`.

### **dk.sleep(duration: number)**
Sleep for a specified duration (in milliseconds)

##### Return object
- `Promise<void>`.