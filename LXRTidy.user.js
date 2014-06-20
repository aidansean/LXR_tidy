// ==UserScript==
// @name        LXRTidy
// @namespace   www.aidansean.com
// @description Tidy up the LXR results page
// @include     http://cmslxr.fnal.gov/lxr/search*
// @version     1
// @grant       none
// ==/UserScript==

var truncate_length = 150 ; // Used to wrap long lines
var CMSSW_version = 'CMSSW_7_0_0' ; // Default value, changed if the page see another version

// Add more colors for other filetypes as you see fit
var colors = [] ;
colors['py'  ] = 'purple' ;
colors['h'   ] = 'blue'   ;
colors['cc'  ] = 'green'  ;
colors['xml' ] = 'red'    ;
colors['misc'] = 'black'  ;

var body = document.getElementsByTagName('body')[0] ;

// First replace text nodes with span tags
for(var i=body.childNodes.length-1 ; i>=0 ; i--){
  if(body.childNodes[i].nodeType==3 && body.childNodes[i].textContent!='' && i>0){
    var textnode = body.childNodes[i] ;
    var span = document.createElement('span') ;
    var text = textnode.textContent ;
    var a    = body.childNodes[i-1] ;
    
    // Truncate long text
    if(text.length>truncate_length){
      text = text.substring(0,truncate_length) + '...' ;
    }
    
    // Escape special characters that would otherwise screw things up
    text = text.replace('<', '&lt;') ;
    text = text.replace('>', '&gt;') ;
    span.innerHTML = text ;
    body.insertBefore(span, textnode) ;
    body.removeChild(textnode) ;
  }
}

// Class for manipulating a single search result
function result_object(atag, span){
  this.atag = atag ;
  this.link = atag.href ;
  this.text = span.innerHTML ;
  this.text = this.text.substring(5) ;
  
  // Define the type here
  this.type = 'misc' ;
  if(this.link.indexOf('.py' )!=-1) this.type = 'py'  ;
  if(this.link.indexOf('.h'  )!=-1) this.type = 'h'   ;
  if(this.link.indexOf('.cc' )!=-1) this.type = 'cc'  ;
  if(this.link.indexOf('.xml')!=-1) this.type = 'xml' ;
  
  this.link_text = this.link.split('http://cmslxr.fnal.gov/lxr/source')[1] ;
  var link_parts = this.link_text.split('/') ;
  this.pack = link_parts[1] + '/' + link_parts[2] ;
  
  // There's probably a much better way to do this
  CMSSW_version = this.link_text.split('?v=')[1].split('#')[0] ;
  
  this.add_tags = function(ul, packages){
    var li = document.createElement('li') ;
    li.style.color = colors[this.type] ;
    
    var span = document.createElement('span') ;
    span.innerHTML = this.type.substring(0,1) ;
    span.style.marginRight   = '1em' ;
    span.style.paddingRight  = '0.5em' ;
    span.style.font          = '12px arial , sans-serif' ;
    span.style.textTransform = 'uppercase' ;
    span.style.width         = '2em' ;
    span.style.textAlign     = 'right' ;
    
    var a = document.createElement('a' ) ;
    a.style.color = colors[this.type] ;
    
    var add_pack = true ;
    for(var i=0 ; i<packages.length ; i++){
      if(this.pack==packages[i][0]){
        add_pack = false ;
        packages[i][1]++ ;
      }
    }
    if(add_pack){
      packages.push([this.pack,1]) ;
    }
    
    a.innerHTML = this.atag.innerHTML ;
    a.href      = this.link ;
        
    var span2 = document.createElement('span') ;
    span2.innerHTML = this.text ;
    span2.style.font = '12px courier , monospace' ;
    span2.style.color = 'black' ;
    span2.style.marginLeft = '2em' ;
    
    li.appendChild(span) ;
    li.appendChild(a) ;
    li.appendChild(span2) ;
    ul.appendChild(li) ;
  }
}

// Parse the newly created tags to get the search results
var parse_tags = false ;
var results = [] ;
var remove_start = -1 ;
var remove_end   = -1 ;
for(var i=0 ; i<body.childNodes.length ; i++){
  var child = body.childNodes[i] ;
  if(child.tagName=='H1'){
    parse_tags = true ;
    remove_start = i ;
  }
  if(parse_tags && child.tagName=='HR'){
    parse_tags = false ;
    remove_end = i ;
  }
  if(parse_tags){
    if(child.tagName=='A' && body.childNodes[i+1].tagName=='SPAN'){
      results.push(new result_object(child, body.childNodes[i+1])) ;
    }
  }
}
// Remove tags so we can replace them with a list
for(var i=remove_end-1 ; i>remove_start ; i--){ body.removeChild(body.childNodes[i]) ; }

// Create a list of results
var ul = document.createElement('ul') ;
var packages = [] ;
for(var i=0 ; i<results.length ; i++){
  var add_pack_li = false ;
  if(i==0){
    add_pack_li = true ;
  }
  else if(results[i].pack!=results[i-1].pack){
    add_pack_li = true ;
  }
  if(add_pack_li){
    var li = document.createElement('li') ;
    var span_pack = document.createElement('span') ;
    var a = document.createElement('a') ;
    a.innerHTML = results[i].pack ;
    a.href = 'http://cmslxr.fnal.gov/lxr/source/' + results[i].pack ;
    span_pack.style.borderTop = '1px solid blue' ;
    span_pack.style.backgroundColor = '#eeeeff' ;
    span_pack.style.padding = '2px' ;
    span_pack.style.color = 'black' ;
    span_pack.appendChild(a) ;
    li.appendChild(span_pack) ;
    li.style.color = 'white' ;
    ul.appendChild(li) ;
  }
  results[i].add_tags(ul, packages) ;
}
body.insertBefore(ul, body.childNodes[remove_start+1]) ;
var h2_results = document.createElement('h2') ;
h2_results.innerHTML = 'Results' ;
body.insertBefore(h2_results, ul) ;

// Add table of packages
var table = document.createElement('table') ;
var thead = document.createElement('thead') ;
var tbody = document.createElement('tbody') ;

var tr = document.createElement('tr') ;
var th = document.createElement('th') ;
th.innerHTML = '' ;
tr.appendChild(th) ;
th = document.createElement('th') ;
th.innerHTML = 'Package' ;
tr.appendChild(th) ;
thead.appendChild(tr) ;
table.appendChild(thead) ;
table.style.borderCollapse = 'collapse' ;
table.style.border = '1px solid black' ;

packages.sort(function (a,b){ return b[1]-a[1] ; }) ;
for(var i=0 ; i<packages.length ; i++){
  var tr = document.createElement('tr') ;
  var td = document.createElement('td') ;
  td.style.padding = '5px' ;
  td.style.textAlign = 'right' ;
  td.innerHTML = packages[i][1] ;
  tr.appendChild(td) ;
  
  td = document.createElement('td') ;
  td.style.padding = '5px' ;
  var a = document.createElement('a') ;
  a.innerHTML = packages[i][0] ;
  a.href = 'http://cmslxr.fnal.gov/lxr/source/' + packages[i][0] + '?v=' + CMSSW_version ;
  td.appendChild(a) ;
  tr.style.backgroundColor = (i%2==0) ? 'white' : '#dddddd' ;
  tr.appendChild(td) ;
  tbody.appendChild(tr) ;
  
}
table.appendChild(tbody) ;
body.insertBefore(table, h2_results) ;

// All done!
