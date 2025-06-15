//global variables (side buttons related)
var timer;
var timer2;
var buttonsContainer;
var leftButtonEl;
var rightButtonEl;
var longSkipLength;

//global variables (other elements)
var skipTopButtonEl;
var asideSearchInputEl;
var loadingImageEl;
var subchapterContainerEl;
var mainTextEl;

//global variables (misc.)
var curChapterNum;
var curSubchapterNum;

//event functions (window)
window.onload = () => {
	buttonsContainer = document.getElementById("buttonsContainer");
	leftButtonEl = document.getElementById("leftB");
	rightButtonEl = document.getElementById("rightB");
	skipTopButtonEl = document.getElementById("skipTop");
	asideSearchInputEl = document.querySelector("#asideSearch input");	
	loadingImageEl = document.getElementById("loadingImage");	
	subchapterContainerEl = document.getElementById("subchapterContainer");	
	mainTextEl = document.getElementById("maintext");
	buttonsContainer.onscroll = showOrHideHeaderSideButtons;
	window.onscroll = showOrHideGoTopButton;
	onresizeAndOnLoad();
}

window.onresize = onresizeAndOnLoad;

//event functions (side buttons)
function scrollToLeft()	{ buttonsContainer.scrollLeft = buttonsContainer.scrollLeft - 4; }
function leftClick()		{ buttonsContainer.scrollLeft = buttonsContainer.scrollLeft - longSkipLength; }
function scrollToRight(){ buttonsContainer.scrollLeft = buttonsContainer.scrollLeft + 4; }
function rightClick()		{ buttonsContainer.scrollLeft = buttonsContainer.scrollLeft + longSkipLength; }

//event functions (header buttons and aside buttons)
function headerButtonClicked(num){
	if ((curChapterNum == num+1) && (curSubchapterNum == 0)) return;
	curChapterNum = num+1; //num 0 refers to chapter 1
	curSubchapterNum = 0;
	
	let scrollClosingTime;
	if (mainTextEl.style.maxHeight === "0px") scrollClosingTime = 0;
	else scrollClosingTime = 1000;

	updateMaxHeight(30); //minimum height of maintext

	//reset aside
	subchapterContainerEl.innerHTML = "";
	asideSearchInputEl.setAttribute("disabled", true);
	asideSearchInputEl.value = "";

	//get chapter info
	//chapters defined in pageTemplate.html
	let curChapterInfo = chapters[num];
	let chapterName = curChapterInfo[0];

	//fetch content
	fetch("/getChapterContent", {
		method: "post",
		body: JSON.stringify({loc: window.location.pathname, num: curChapterNum, name: chapterName})
	})
	.then(res => res.text())
	.then(res => window.setTimeout(updateMainTextAndAside, scrollClosingTime, curChapterInfo, res))
	.catch(err => window.setTimeout(updateMainText, scrollClosingTime, chapterName, err));

	//show loading gif
	window.setTimeout(()=>{ loadingImageEl.style.visibility = "visible"; }, scrollClosingTime);
}

function asideButtonClicked(subchapterNum){
	if (curSubchapterNum == subchapterNum) return;

	//subchapterNum starts with 1
	if (curSubchapterNum) document.getElementById("asideButton"+curSubchapterNum).classList.remove("selected");
	curSubchapterNum = subchapterNum;
	document.getElementById("asideButton"+curSubchapterNum).classList.add("selected");

	let scrollClosingTime;
	if (mainTextEl.style.maxHeight === "0px") scrollClosingTime = 0;
	else scrollClosingTime = 1000;

	updateMaxHeight(0);

	let chapterName = chapters[curChapterNum-1][0];
	let subchapterName = chapters[curChapterNum-1][curSubchapterNum];
	fetch("/getSubchapterContent", {
		method: "post",
		body: JSON.stringify({
			loc: window.location.pathname, 
			chapNum: curChapterNum, 
			chapName: chapterName, 
			subChapNum: curSubchapterNum,
			subchapterName: subchapterName
		})
	})
	.then(res => res.text())
	.then(res => window.setTimeout(updateMainText, scrollClosingTime, subchapterName, res))
	.catch(err => window.setTimeout(updateMainText, scrollClosingTime, subchapterName, err, true));
}

//assist functions
function onresizeAndOnLoad(){
	//incase width changed
	showOrHideHeaderSideButtons();
	updateLongSkipLength();
	//incase height changed
	updateMaxHeight();
}

function updateLongSkipLength() { longSkipLength = Math.floor(buttonsContainer.scrollWidth / 5); }

function showOrHideHeaderSideButtons() {
	let showButtonsPossible = buttonsContainer.scrollWidth > window.innerWidth;
	if (
		showButtonsPossible &&
		buttonsContainer.scrollLeft
	) leftButtonEl.classList.add("allowHover");
	else leftButtonEl.classList.remove("allowHover");

	if (
		showButtonsPossible &&
		((buttonsContainer.scrollWidth - buttonsContainer.clientWidth) > buttonsContainer.scrollLeft) 
	) rightButtonEl.classList.add("allowHover");
	else rightButtonEl.classList.remove("allowHover");
}

function showOrHideGoTopButton(){
	(window.pageYOffset > 500) ?
		skipTopButtonEl.classList.add("allowHover") :
		skipTopButtonEl.classList.remove("allowHover");
}

function updateMainTextAndAside(curChapterInfo, res){
	//loading finished
	loadingImageEl.style.visibility = "hidden";

	//update elements
	updateAside(curChapterInfo.slice(1));
	updateMainText(curChapterInfo[0], res);
}

function updateAside(subChapters){
	if(!subChapters.length) return;

	asideSearchInputEl.removeAttribute("disabled");
	subChapters.forEach((subchapterName, i)=>{
		let subchapterNum = i+1;
		let curP = document.createElement("p");
		curP.innerHTML = subchapterName.replaceAll("_", " ");
		let curButton = document.createElement("button");
		curButton.appendChild(curP);
		curButton.setAttribute("type","button");
		curButton.id = "asideButton" + subchapterNum;
		curButton.onclick = () => asideButtonClicked(subchapterNum);
		subchapterContainerEl.appendChild(curButton);
	});
}

function updateMainText(title, res, fetchError = false){
	let formattedTitle = title.replaceAll("_", " ");

	//Handle fetch error
	if (fetchError) {
		console.error(fetchError);
		mainTextEl.innerHTML = `<h3>${formattedTitle}</h3><p>There was an error fetching content. Please report this!</p>`;
		return;
	}

	//Handle FILE_NOT_FOUND
	if (res === "FILE_NOT_FOUND") { 
		if (curSubchapterNum) console.log(`not found: ${chapters[curChapterNum-1][0]} ${chapters[curChapterNum-1][curSubchapterNum]}`);
		else console.log(`not found: ${chapters[curChapterNum-1][0]}`);
		return; 
	}

	//assume res contains html content
	if (res.includes("<h3>")) mainTextEl.innerHTML = res;
	else mainTextEl.innerHTML = `<h3>${formattedTitle}</h3>${res}`;
	
	//add [lang] to arabic elements
	//add .verseSpan to verse elements
	var emptyElsWithVerse = [];
	var verses = [];
	for (let arabicEl of document.querySelectorAll(".arabic, .bulletArabic")) {
		arabicEl.setAttribute("lang","ar");
		arabicEl.setAttribute("dir","rtl");
		if (arabicEl.getAttribute("verse")) {
			// if empty, extract verse from backend later
			if(!arabicEl.textContent.length) {
				emptyElsWithVerse.push(arabicEl);
				verses.push(arabicEl.getAttribute("verse"))
			}
			else arabicEl.textContent = arabicEl.textContent + "۞ ";
			let span = document.createElement("span");
			span.textContent = arabicEl.getAttribute("verse");
			span.classList.add("verseSpan");
			arabicEl.appendChild(span);
		}
	}

	//eval source section
	let referencesEl = document.querySelector("#references, #reference");
	if (referencesEl) {
		let sourcesHeading = document.createElement("h5");
		sourcesHeading.textContent = "Sources";
		mainTextEl.insertBefore(sourcesHeading, referencesEl);
	}

	//extract verses from backend for empty verse elements
	//then update max height
	if (emptyElsWithVerse.length)
		fetch(`/getVerses`,{
			method: "post",
			body: JSON.stringify(verses)
		})
		.then(res => res.json())
		.then(res => {
			emptyElsWithVerse.forEach((el, i) => el.innerHTML = res[i] + el.innerHTML);
			updateMaxHeight();
		})
		.catch(console.error);
	else updateMaxHeight();
}

function updateMaxHeight(newHeightParameter = -1) {
	let newHeight;
	if (newHeightParameter == -1) newHeight = mainTextEl.scrollHeight + 'px'; 
	else newHeight = newHeightParameter + 'px';
	mainTextEl.style.maxHeight = newHeight;

	document.documentElement.style.setProperty('--bottomScrollBgPos', newHeight);
}