// background.js

//Global variables readable from popup.js
var shoppingbagitems;

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
      // shoppingbagitems =  request.payload;
      // shoppingbagobjects = jQuery.parseHTML(shoppingbagitems);
      // createShoppingBagTable(shoppingbagobjects[0]);
    }
    if( request.message == "oniconclick" ){
      console.log("Message received: oniconclick");
      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
          currentURL = tabs[0].url;
          console.log("Current URL:" + currentURL);
          if(currentURL != null){
            var viewcarturl = getShoppingCartViewUrl(currentURL);
            getShoppingCartView(viewcarturl);
          }
      });
    }
  }
);

function string2DOM(text){
  var div = document.createElement('div');
  div.innerHTML = s;
  return div;
  //var elements = div.childNodes;
}
