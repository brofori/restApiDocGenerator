# restApiDocGenerator
Simple script for generating Latex or PDF rest api documentations.

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

## Usage

When running the software with -- mode main.js v1 -- a tex file is generated.

For generating a pdf file use -- node main.js pdf --

If you want to use the generated .tex file within an existing latex documentation add the -- nh -- argument to prevent generation of headers. 

## Examples
Pleas have a look at the -- example.pdf -- and the json files in the -- api/v1 -- folder.

