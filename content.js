// content.js

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");
      console.log(firstHref);
	  //alert("Hello from your Chrome extension!")

  addLinksToShoppingCart()


  }
}
);

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

function processElement(e){
  html = e.innerHTML
  text = e.innerText
  console.log(text);
  cat = extractCatalogNumber(text);
  console.log(cat);
  url = getSearchURL(cat);
  e.innerHTML = addLink(html,url);
}

function addLink(html,url){
  newHTML = "<a href="+url+">"+html+"</a>";
  return newHTML;
}

function getSearchURL(catalogNumber){
  //TODO: retrieve the actual base URL so it works in all countries
  //TODO: retrieve the link from the search results and redirect
  baseURL = "http://il.nextdirect.com/en/search/SearchTerm-";
  url = baseURL + catalogNumber;
  return url;
}

function extractCatalogNumber(text){
  return text.substring(text.length - 11);
}

function getElementsInShoppingCart(){
  return document.getElementsByClassName("basketDesc");
}

function openNewTab(url){
  chrome.runtime.sendMessage({"message": "open_new_tab", "url": url});
}

//<div class="basketDesc">
//<span>Velvet Block Heel Boots</span>
//<br>
//<br>433-265-G64</div>
