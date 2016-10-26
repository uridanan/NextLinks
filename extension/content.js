// content.js
var myShoppingBag = {};

sendShoppingBagToPopup();
addLinksToShoppingCart();


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "searchresult" ) {
        url = request.url;
        cat = request.cat;
        console.log("Search Result received for " + cat + ": " + url);
        e = myShoppingBag[cat];
        html = e.innerHTML;
        e.innerHTML = addLink(html,url);
    }
  }
);


///////////////////////////////////////////////////////////////////////////////
//Add Links to shopping cart
///////////////////////////////////////////////////////////////////////////////

function addLinksToShoppingCart(){
  var elements = getElementsInShoppingCart();
  for (var i in elements) {
    if (elements.hasOwnProperty(i)) {
      e = elements[i];
      processElement(e);
      console.log(e.innerHTML);
    }
  }
}

function getElementsInShoppingCart(){
  return document.getElementsByClassName("basketDesc");
}

function processElement(e){
  html = e.innerHTML;
  text = e.innerText;
  console.log(text);
  cat = extractCatalogNumber(text);
  console.log(cat);
  myShoppingBag[cat] = e;
  url = getSearchURL(cat);
  getPageContent(url, cat);
}

function getPageContent(url, cat){
  chrome.runtime.sendMessage({"message": "getpagecontent", "url": url, "cat": cat});
}

function sendMessage(msg, url){
  chrome.runtime.sendMessage({"message": msg, "url": url});
}

//Called in the callback from getPageContent
function addLink(html,url){
  newHTML = "<a target=\"_blank\" href="+url+">"+html+"</a>";
  return newHTML;
}

///////////////////////////////////////////////////////////////////////////////
//Send shopping bag to popup
///////////////////////////////////////////////////////////////////////////////

function sendShoppingBagToPopup(){
  var shoppingbag = extractShoppingBag();
  console.log("Send shoppingbag: " + shoppingbag);
  chrome.runtime.sendMessage({"message": "shoppingbagitems", "payload": shoppingbag});
}

function extractShoppingBag(){
  var bag;
  var elements = document.getElementsByClassName("orderCells");
  if(elements != null && elements.length > 0){
    bag = elements[0].outerHTML;
  }
  return bag;
}
