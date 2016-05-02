# restApiDocGenerator
Simple and easy to use script for generating Latex or PDF rest api documentations.

## Setup

Copy the restApiDocGenerator.js file to your projects documentation foler or any place where you want to have your documantation. Then create an api-doc folder on the same level. Within the api-doc folder you create a version folder.
This should result in following directory structure:
- yourProjectRoot
  |- restApiDocGenerator.js
  |- api-doc
    |- v1

Within the version folder you can create json files to specify the api. Create a json file for each group of endpoints for example -- users.json, exampleEndpoint.json --. The file name will be used to display the base route.

### JSON Structure
users.json
```javascript
[
  {
    "route": "/",
    "method": "POST",
    "description": "Update User.",
    "request": {
      "email": {
        "type": "string",
        "locatedIn": "body",
        "required": true,
        "description": "User email.",
        "value": "String"
      },
      "password": {
        "type": "string",
        "locatedIn": "body",
        "required": true,
        "description": "User password.",
        "value": "String"
      },
      "name": {
        "type": "string",
        "locatedIn": "body",
        "required": true,
        "description": "User name.",
        "value": "String"
      }
    },
    "responses": {
      "200": {
        "message": "message text",
        "status": true,
        "data": {}
      },
      "401": {
        "message": "message text",
        "status": true,
        "error": "Error message"
      }, ...
    }
  }, ...
]
```

## Requirements
- node.js
- latex

Also make sure to add both requirements to your -- PATH --

## Usage

When running the software with -- mode main.js v1 -- a tex file is generated.

For generating a pdf file use -- node main.js pdf --

If you want to use the generated .tex file within an existing latex documentation add the -- nh -- argument to prevent generation of headers. 

## Examples
Pleas have a look at the -- example.pdf -- and the json files in the -- api/v1 -- folder.

## Licence

Copyright (c) [2016] [Kwame Ofori]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

