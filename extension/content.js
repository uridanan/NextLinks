// content.js

addLinksToShoppingCart();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");
      console.log(firstHref);
	  //alert("Hello from your Chrome extension!")
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
  newHTML = "<a target=\"_blank\" href="+url+">"+html+"</a>";
  return newHTML;
}

function getCurrentURL(){
  return window.location.href;
}

function getCurrentHostname(){
  return window.location.hostname;
}

function getCurrentPathName(){
  return window.location.pathname;
}

function getViewCartPathname(){
  return "ViewData/ViewCart-View";
}

function getSearchPathname(){
  return "search/SearchTerm-";
}

function getBaseURL(){
  baseURL = getCurrentURL();
  baseURL = baseURL.substring(0,baseURL.length - getViewCartPathname().length);
  //console.log(baseURL);
  return baseURL;
}

function getSearchURL(catalogNumber){
  //TODO: retrieve the link from the search results and redirect
  //searchURL = "http://il.nextdirect.com/en/search/SearchTerm-";
  //url = searchURL + catalogNumber;
  searchURL = getBaseURL() + getSearchPathname() + catalogNumber;
  return searchURL;
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
