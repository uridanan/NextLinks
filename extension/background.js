// background.js

//Global variables readable from popup.js
var shoppingbagitems;

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
    if( request.message == "shoppingbagitems" ){
      console.log("Message received: shoppingbagitems");
      shoppingbagitems =  request.payload;
      shoppingbagobjects = jQuery.parseHTML(shoppingbagitems);
      createShoppingBagTable(shoppingbagobjects[0]);
    }
  }
);

function createShoppingBagTable(shoppingbagobject){
  //Copy bag to HTML document
  shoppingbagtable = getItems(shoppingbagobject);
  shoppingbagitems = shoppingbagtable.outerHTML;
}

function getItems(shoppingbagobject){
  var table = document.createElement('table');
  //table.style.border = "1";table.border = "1";
  table.style.width ="100%";table.width ="100%";

  var items = getItemRows(shoppingbagobject);
  for (var i in items) {
    if (items.hasOwnProperty(i)) {
      var row = table.insertRow(i);

      // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);

      // Add some text to the new cells:
      cell1.innerHTML = getItemImage(items[i]);
      cell2.innerHTML = getItemText(items[i]);
    }
  }
  return table;
}

function getItemRows(shoppingbagobject){
  //Handle the items rows: class name is bglight
  return shoppingbagobject.getElementsByClassName("bgLight");
}

function getItemImage(item){
  var basketImage = item.getElementsByClassName("basketImage");
  if(basketImage != null && basketImage.length > 0){
    return basketImage[0].innerHTML;
  }
}

function extractCatalogNumber(text){
  return text.substring(text.length - 11);
}

function extractDescription(text){
  return text.substring(0,text.length - 11);
}

function getItemText(item){
  var basketDesc = item.getElementsByClassName("basketDesc");
  if(basketDesc != null && basketDesc.length > 0){
        var text = basketDesc[0].innerText;
        var cat = extractCatalogNumber(text);
        var desc = extractDescription(text);
        return desc + "<br>" + cat;
  }
}

function getSelectedText(cell){
  return cell.options[cell.selectedIndex].text;;
}

function string2DOM(text){
  var div = document.createElement('div');
  div.innerHTML = s;
  return div;
  //var elements = div.childNodes;
}

/////////////////////////////////////////////////////////////////
//Obsolete approach - Begin
/////////////////////////////////////////////////////////////////

//Remove unwanted cells from the shopping bag table
function formatShoppingBag(shoppingbagobject){
  //Get rid of the remove and availability cells.
  //Handle the headers row: first TR element
  var rows = shoppingbagobject.getElementsByTagName("TR");
  if(rows != null && rows.length > 0){
    var headers = rows[0];
    deleteLastCell(headers);
    deleteLastCell(headers);
  }

  //Handle the items rows: class name is bglight
  var items = shoppingbagobject.getElementsByClassName("bgLight");
  for (var i in items) {
    if (items.hasOwnProperty(i)) {
      deleteLastCell(items[i]);
      deleteLastCell(items[i]);
    }
  }

  //Use size cells innertext only
  //Use quantity cells innertext only
  flattenSelectCells(shoppingbagobject);

  //Copy bag to HTML document
  shoppingbagitems = shoppingbagobject.outerHTML;

}

function flattenSelectCells(doc){
  var cells = doc.getElementsByTagName("select");
  for (var i in cells) {
    if (cells.hasOwnProperty(i)) {
      cells[i].outerHTML = getSelectedText(cells[i]);
    }
  }
}

function deleteLastCell(row){
  r = row;
  console.log(r.outerHTML);
  cells = r.cells;
  last = cells[cells.length-1];
  console.log(last.outerHTML);
  last.outerHTML = "";
}

/////////////////////////////////////////////////////////////////
//Obsolete approach - End
/////////////////////////////////////////////////////////////////


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
