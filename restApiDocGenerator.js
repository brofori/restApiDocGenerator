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
/* VARIABLES */

var methodEnum = { ANY: {color: 'Gray'}, GET: {color: 'YellowGreen'}, POST: {color: 'NavyBlue'}, PUT: {color:'magenta'}, DELETE: {color:'red'}};

/* FUNCTIONS */

var parseDocument = function (content) {    
    documentStr = '\\begin{document} \n';
    documentStr += content;
    documentStr += '\n \\end{document} \n'
    
    return documentStr;
}


var parseSingleEndpoint = function(endpoint){
    var methodstr = '';
    var method = endpoint.method.toUpperCase();
    
    methodstr += '\\subsubsection*{';
    methodstr += '\\textcolor{' + methodEnum[method].color + '}{'+ method +'} ';
    methodstr += endpoint.route;
    methodstr += '}\n';
    
    var descriptionStr = '\\subsubsection{Description:} \n';
    descriptionStr += endpoint.description + '\n ';
    // descriptionStr += '\\\\ \n';
    var requestParamStr = '\\subsubsection{Request Parameters:} \n \n';
    
    
    requestParamStr += '\\begin{tabular}{ | l | l | l | l | l | p{5cm} |} \n \\hline \n';
    requestParamStr += '\\textbf{Name} & \\textbf{Located In} & \\textbf{Description} & \\textbf{Required} & \\textbf{Type}\\\\ \\hline \n';
    
    var keys = Object.keys(endpoint.request),
        requestParams = endpoint.request;
    for(var i = keys.length -1; i>= 0; i--) {
        var paramValues = requestParams[keys[i]],
            required = paramValues.required ? '\\textcolor{red}{YES}' : 'NO';
        requestParamStr += keys[i] + ' & ' + paramValues.locatedIn + ' & ' + paramValues.description + ' & ' + required + ' & ' + paramValues.type +'\\\\ \\hline \n';
    }
    requestParamStr += '\\end{tabular} \n \n';
    
    
    var responseParamStr = '\\subsubsection{Responses:}\n  \n',
        resKeys = Object.keys(endpoint.responses),
        responses = endpoint.responses;
    for(var i = resKeys.length -1; i>= 0; i--) { 
        // responseParamStr += resKeys[i] + ' \\newline \n';
        responseParamStr += '\\begin{lstlisting}[frame=single, title=\\textbf{'+ resKeys[i] +'}] \n';
        responseParamStr += JSON.stringify(responses[resKeys[i]], null, 4) + '\n';
        responseParamStr += '\\end{lstlisting}\n  \n';
    }
    
    return methodstr + descriptionStr + requestParamStr + responseParamStr;
}

var parseEndpoints = function(baseRoute, endpoints) {
    // var latexStr = '\\subsection*{/'+ endpointBaseName.substring(0,endpointBaseName.indexOf('.')) +'}\n';
    var latexStr = '\\subsection*{/'+ baseRoute +'}\n';
    
    for(var j = endpoints.length -1; j >= 0; j--) {
        latexStr += parseSingleEndpoint(endpoints[j]);
    }
    
    return latexStr;
}

function readRouteDir(baseDir) {
    "use strict"
    let enpoints = {};

    let dir = fs.readdirSync(baseDir);
    for (let i = 0; i<dir.length; i++) {
        console.log(baseDir+dir[i])
        if(fs.lstatSync(baseDir+dir[i]).isDirectory() ){
            enpoints[dir[i]]=readRouteDir(baseDir+dir[i]+'/'); 
        }else{
            enpoints[dir[i]]=JSON.parse(fs.readFileSync(baseDir+dir[i])); 
        }
    }
    return enpoints;
}

var parentKey = '';
function bulildEndpointLatex(routes) {
    "use strict"
    let endpointString = ''

    for (let routeKey in routes) {
        if(routes[routeKey] instanceof Object && !routes[routeKey].method) {
            continue;
        } else {
            endpointString += parseSingleEndpoint(routes[routeKey])
        }
    }

    for (let routeKey in routes) {
        if(routes[routeKey] instanceof Object && !routes[routeKey].method) {
            endpointString += '\\subsection*{'+ parentKey + '/' + routeKey +'}\n';
            parentKey += '/'+routeKey;
            endpointString += bulildEndpointLatex(routes[routeKey]);
        }
    }
    parentKey = ''
    return endpointString;
}


/* 
*
*   MAIN 
*
*
*/

/**
 * Arguments:
 * 
 *  - tex: generate .tex file
 *  - pdf: generate .pdf file
 * 
 *  - nh: don't set header. (API Documentation)
 *  - ptT: build partial .tex file (No usepackage and \begin document strings). For including in existing tex file.
 *  - version=NAME_OF_VERSION_FOLDER: sets which version should be used.
 * 
 *  - filename=YOUR_FILENAME: sets the output filename.
 */

var setHeader = true;
var setDocumentHeader = true;
var compileTex = true; 
var outFileName = "restApiDocumentation";
var version = "";
var baseDir = __dirname+'/api-doc/';
var versionDir = ''
var partialTex = false;

process.argv.slice(2).forEach(function (val, index, array) {
  console.log(index + ': ' + val);
  
  if(val == 'nh') {
      setHeader = false;
  }
  
  if(val == 'ptT') {
      partialTex = true;
  }
  
  if(val == 'pdf') {
      compileTex = true;
      setDocumentHeader = true;
      console.log('compile: ' + compileTex)
  }

  if(val.substring(0, val.indexOf('=')) == 'filename') {
      outFileName = val.substring(val.indexOf('=')+1, val.length);
  }
  
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

var endpointsLatex = bulildEndpointLatex(routes);

// for (var baseRoute in endpoints[version]) {
//     endpointsLatex[baseRoute] = parseEndpoints(baseRoute, endpoints[version][baseRoute]);
// }

var latexOutString = ''

/**
 * Set document header
 */
var documentHeaderStr = '';

if(setDocumentHeader) {
    documentHeaderStr += '\\documentclass{article} \n';
    documentHeaderStr += '\\usepackage{listings} \n';
    documentHeaderStr += '\\usepackage[usenames,dvipsnames]{color} \n';
    documentHeaderStr += '\\setcounter{secnumdepth}{0} \n';
    documentHeaderStr += '% Margins \n \\topmargin=-0.45in \n \\evensidemargin=0in \n \\oddsidemargin=0in \n \\textwidth=6.5in \n \\textheight=9.0in \n \\headsep=0.25in \n';
    documentHeaderStr += '\\usepackage{caption} \n \\captionsetup{ \n  font=footnotesize, \n justification=raggedright, \n singlelinecheck=false \n}';
}

/**
 * Set header
 */
    
if(setHeader) {
    latexOutString += '\\section{Rest API Documentation} \n';
}

/**
 * set endpoint output
 */



// if (endpointsLatex['base']) {
//     latexOutString += endpointsLatex['base'];
// }

// for (var key in endpointsLatex){
//     if(key == 'base') {
//         continue;
//     }
    
//     latexOutString += endpointsLatex[key];    
// }

latexOutString += endpointsLatex;

/* Full latex document or partial document for including in existing latex. */
if(partialTex) {
    var documentStr = latexOutString;
} else {
    var documentStr = documentHeaderStr + parseDocument(latexOutString);
}

/**
 * Save file.
 */
var dirName = baseDir + 'tex/';
if (!fs.existsSync(dirName)){
    fs.mkdirSync(dirName);
}

fs.writeFile(dirName + outFileName + '.tex', documentStr, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The .tex file was saved!");
}); 

/**
 * Compile tex file to pdf.
 */
if(compileTex) {
    var cmd = 'pdflatex ' + dirName + outFileName;

    exec(cmd, function(error, stdout, stderr) {
        if(error)
            console.log(error);
        if(stdout)
            console.log(stdout);
        if(stderr)
            console.log(stderr);
            
        if(!error) {
            fs.unlink('./'+ outFileName + '.log');
            fs.unlink('./'+ outFileName + '.aux');
            console.log('success!')
        }
    });
}
           
    

