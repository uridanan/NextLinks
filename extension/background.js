// background.js

//Global variables readable from popup.js
var shoppingbagitems;

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
    console.log("Message received: clicked_browser_action");
    //getShoppingCartView();
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


function string2DOM(text){
  var div = document.createElement('div');
  div.innerHTML = s;
  return div;
  //var elements = div.childNodes;
}
