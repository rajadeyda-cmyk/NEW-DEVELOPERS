const	quoteCard	=	document.getElementById("quote-card");
const	quoteTextEl	=	document.getElementById("quote-text");
const	quoteAuthorEl	=	document.getElementById("quote-author");
const	newQuoteBtn	=	document.getElementById("new-quote-btn");
const	saveQuoteBtn	=	document.getElementById("save-quote-btn");
const	statusEl	=	document.getElementById("status-message");
const	favoritesList	=	document.getElementById("favorites-list");
const	API_URL	=	"https://dummyjson.com/quotes/random";
const	FAVORITES_KEY	=	"favorite-quotes";
let	currentQuote	=	null;
async	function	fetchNewQuote()	{
//	Visual:	dim	the	card	so	the	user	sees	something	is	happening.
quoteCard.classList.add("is-loading");
setButtonsDisabled(true);
setStatus("Loading	new	quote...",	"");
try	{
const	response	=	await	fetch(API_URL);
//	fetch()	does	NOT	throw	on	HTTP	errors	(404,	500,	etc.)
//	We	have	to	check	response.ok	ourselves.
if	(!response.ok)	{
throw	new	Error(`Server	returned	${response.status}`);
}
const	data	=	await	response.json();
currentQuote	=	{
text:	data.quote,
author:	data.author
};
displayQuote(currentQuote);
setStatus("",	"");
}	catch	(error)	{
console.error("Failed	to	fetch	quote:",	error);
setStatus("Couldn't	load	a	new	quote.	Check	your	connection	and	try	again.",	"is-error");
}	finally	{
quoteCard.classList.remove("is-loading");
setButtonsDisabled(false);
}
}
function	displayQuote(quote)	{
quoteTextEl.textContent	=	quote.text;
quoteAuthorEl.textContent	=	quote.author;
}
function	setStatus(message,	className)	{
statusEl.textContent	=	message;
statusEl.className	=	"status";
if	(className)	{
statusEl.classList.add(className);
}
}
function setButtonsDisabled(disabled) {
	newQuoteBtn.disabled = disabled;
	saveQuoteBtn.disabled = disabled;
}

newQuoteBtn.addEventListener("click", fetchNewQuote);
function	getFavorites()	{
const	raw	=	localStorage.getItem(FAVORITES_KEY);
if	(!raw)	{
return	[];
}
try	{
return	JSON.parse(raw);
}	catch	(error)	{
console.error("Bad	favorites	data,	resetting:",	error);
return	[];
}
}
function	saveFavorites(favorites)	{
localStorage.setItem(FAVORITES_KEY,	JSON.stringify(favorites));
}
function	saveCurrentQuote()	{
//	Safety:	can't	save	if	no	quote	has	loaded	yet.
if	(!currentQuote)	{
setStatus("Load	a	quote	first.",	"is-error");
return;
}
const	favorites	=	getFavorites();
//	Don't	save	duplicates.
const	alreadySaved	=	favorites.some(function	(fav)	{
return	fav.text	===	currentQuote.text;
});
if	(alreadySaved)	{
setStatus("You've	already	saved	this	quote.",	"is-error");
return;
}
//	Add	to	the	front	so	newest	favorites	appear	on	top.
favorites.unshift({
text:	currentQuote.text,
author:	currentQuote.author,
savedAt:	Date.now()
});
saveFavorites(favorites);
renderFavorites();
setStatus("Saved	to	favorites.",	"is-success");
}
function	renderFavorites()	{
const	favorites	=	getFavorites();
const	emptyMessage	=	document.getElementById("favorites-empty");
//	Clear	what's	currently	in	the	list.
favoritesList.innerHTML	=	"";
//	Show	or	hide	the	"no	favorites	yet"	message.
if	(favorites.length	===	0)	{
emptyMessage.style.display	=	"block";
return;
}
emptyMessage.style.display	=	"none";
//	Build	each	row.
favorites.forEach(function	(fav)	{
const	li	=	document.createElement("li");
li.className	=	"favorite-item";
const	content	=	document.createElement("div");
content.className	=	"favorite-content";
const	textP	=	document.createElement("p");
textP.className	=	"favorite-text";
textP.textContent	=	`"${fav.text}"`;
const	authorP	=	document.createElement("p");
authorP.className	=	"favorite-author";
authorP.textContent	=	`—	${fav.author}`;
content.appendChild(textP);
content.appendChild(authorP);
const	removeBtn	=	document.createElement("button");
removeBtn.className	=	"remove-btn";
removeBtn.textContent	=	"Remove";
removeBtn.addEventListener("click",	function	()	{
removeFavorite(fav.savedAt);
});
li.appendChild(content);
li.appendChild(removeBtn);
favoritesList.appendChild(li);
});
}

function	removeFavorite(savedAt)	{
const	favorites	=	getFavorites();
const	filtered	=	favorites.filter(function	(fav)	{
return	fav.savedAt	!==	savedAt;
});
saveFavorites(filtered);
renderFavorites();
}
saveQuoteBtn.addEventListener("click",	saveCurrentQuote);
//	On	page	load:	render	existing	favorites	first,	then	fetch	our	first	quote.
renderFavorites();
fetchNewQuote();