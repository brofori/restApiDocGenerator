/**
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
 */

const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');


function readRouteDir(baseDir) {
    "use strict"
    let enpoints = {};

    let dir = fs.readdirSync(baseDir);
    for (let i = 0; i<dir.length; i++) {
        if(fs.lstatSync(baseDir+dir[i]).isDirectory() ){
            enpoints[dir[i]]=readRouteDir(baseDir+dir[i]+'/'); 
        }else{

            enpoints[dir[i].slice(0, -5)]=JSON.parse(fs.readFileSync(baseDir+dir[i])); 
        }
    }
    return enpoints;
}

// function generateGetRoute(parentKey, endpoint) {
//     app.get('/'+parentKey+'/'+endpoint)
// }

function parseRoute(routePath) {
    return [];
}

function validateRequest(request,endpointRequest) {
    "use strict"
    let routePrams = request.params;
    for(let routeParam in endpointRequest) {

        if(endpointRequest[routeParam].locatedIn == 'query' && endpointRequest[routeParam].required) {
            if(!request.params[routeParam] && !request.params[routeParam] instanceof endpointRequest[routeParam].type) {
                return false;
            }
        }

        if(endpointRequest[routeParam].locatedIn == 'body' && endpointRequest[routeParam].required) {
            if(!request.params[routeParam] && !request.params[routeParam] instanceof endpointRequest[routeParam].type) {
                return false;
            }
        } else {
            if(request.params[routeParam] && !request.params[routeParam] instanceof endpointRequest[routeParam].type) {
                return false;
            }
        }
    }

    return true;
}

function parseResponseBody(request,endpoint) {
    "use strict"
    console.log(request);
    let routePrams = parseRoute(request.route.path);
    //TODO: recursive json response parser for 200 responses.
    if(endpoint.responses['200']) {
        return endpoint.responses['200'];
    }
    if(endpoint.responses['201']) {
        return endpoint.responses['201'];
    }
    return {'error': '200/201 response not defined'};
}

var parentKey = '';
function generateRouteStubs(routes) {
    "use strict"

    for (let routeKey in routes) {
        if(routes[routeKey] instanceof Object && !routes[routeKey].method) {
            continue;
        } else {
            let path = parentKey+routes[routeKey].route
            console.log('method: '+routes[routeKey].method+'path: ' + path);
            let endpointRequest = routes[routeKey].request;
            switch(routes[routeKey].method) {
                case 'GET':
                    app.get(path,function(req,res) {
                        if(validateRequest(req, routes[routeKey].request)){
                            res.send(parseResponseBody(req,routes[routeKey]));
                        }
                    });
                case 'PUT':
                    
                    app.put(path,function(req,res) {
                        routeKey = 'put_'+req.originalUrl.slice(1,req.originalUrl.length)
                        if(validateRequest(req, routes[routeKey].request)){
                            res.send(parseResponseBody(req,routes[routeKey]));
                        }
                    });
                case 'POST':
                    app.post(path,function(req,res) {

                        if(validateRequest(req, routes[routeKey].request)){
                            res.send(parseResponseBody(req,routes[routeKey]));
                        }
                    });
                case 'DELETE':
                    app.delete(path,function(req,res) {
                        if(validateRequest(req, routes[routeKey].request)){
                            res.send(parseResponseBody(req,routes[routeKey]));
                        }
                    });
                default:
                    continue;
            }
        }
    }

    for (let routeKey in routes) {
        if(routes[routeKey] instanceof Object && !routes[routeKey].method) {
            parentKey += '/'+routeKey;
            generateRouteStubs(routes[routeKey]);
        }
    }
    parentKey = ''
    return;
}


/* 
*
*   MAIN 
*
*
*/

var express = require('express');
var app = express();


var version = "";
var baseDir = __dirname+'/api-doc/';
var versionDir = ''

process.argv.slice(2).forEach(function (val, index, array) {
  if(val.substring(0, val.indexOf('=')) == 'version') {
      version = val.substring(val.indexOf('=')+1, val.length);
  }
});

if(!version) {
    var dirs = fs.readdirSync(__dirname+'/api-doc');
    version = path.basename(baseDir + dirs[dirs.length -1]);
}

var baseRouteDir = baseDir + version + '/';

var routes = readRouteDir(baseRouteDir);

generateRouteStubs(routes);

var server = app.listen(8081,'localhost', function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})