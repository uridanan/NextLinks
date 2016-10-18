// background.js

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "open_new_tab" ) {
      chrome.tabs.create({"url": request.url});
    }
    if( request.message == "getpagecontent" ){
      console.log("Message received: getpagecontent");
      getPageContent(request.url, request.cat);
    }
  }
);

//Send message with URL from content.js, catch in message listener and send xhr
//Parse response then send new url back to content.js with message
function getPageContent(url, cat){
  var x = new XMLHttpRequest();
  x.overrideMimeType('text/xml');
  console.log("getPageContent for: " + url);
  x.open('GET', url);
  x.onreadystatechange = function() {
    if (x.readyState == 4 && x.status == 200) {
      processResponse(x.responseText, cat);
      //alert(x.responseText);
    }
  };
  x.send();
}

function processResponse(response, cat){
  //add code to handle response here
  //parse response HTML and find the first search result
  console.log("process xhr response");
  //console.log(response);

  text = extractTextCell(response);
  console.log(text);

  xmlDoc = jQuery.parseXML(text);
  target = getFirstLink(xmlDoc);
  sendMessage("searchresult", target, cat);
}

function getFirstLink(xmlDoc){

  if(xmlDoc == null){
    return null;
  }

  //searchresults = xmlDoc.getElementsByClassName("textCell");
  links = xmlDoc.getElementsByTagName("a");
  if(links.length > 0 && links[0].hasAttribute("href")){
    target = links[0].getAttribute("href");
    console.log(target);
    return target;
  }
  return null;
}

function extractTextCell(response){
  //Extract the relevant div then convert into xmlDoc
  start = response.search("<div class=\"textCell\">");
  eod = response.length-1;
  substr = response.substring(start,eod);
  end = substr.search("</a>");
  text = substr.substring(0,end+11);

  return text;
}

function sendMessage(msg, url, cat){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": msg, "url": url, "cat": cat});
  });
}


////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
// chrome.browserAction.onClicked.addListener(function(tab) {
//     var link = tab.url;
//     var x = new XMLHttpRequest();
//     x.open('GET', 'http://example.com/?whatever=' + link);
//     x.onload = function() {
//
//     };
//     x.send();
// });

//https://developer.chrome.com/extensions/xhr

//The elements we are looking for
// <div class="SRresultCell"><div class="imageCell">
// <a href="http://il.nextdirect.com:80/en/item/g6462s4?ItemNumber=769686&amp;SearchTerm=769-686-G64" title="Black Stitch Detail Dress"><img src="http://cdn.next.co.uk/COMMON/Items/default/default/itemimages/search/224x336/769686.jpg" alt="Black Stitch Detail Dress"/>
// </a>
// </div>
// <div class="textCell">
// <a href="http://il.nextdirect.com:80/en/item/g6462s4?ItemNumber=769686&amp;SearchTerm=769-686-G64"
// title="Black Stitch Detail Dress">
// <div class="itemLabel">Black Stitch Detail Dress</div>
// <div class="itemPrice"><span class="price_ILS">₪ 145</span></div>
// </a>
// </div>
// </div></div>
