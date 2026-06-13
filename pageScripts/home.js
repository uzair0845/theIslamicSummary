// GLOBAL VARIABLES ---------------------------
const	notFoundEl = document.createElement("p");
var sectionEl;
var allowSearchClick = false;
var topics; //defined in topics.ts
var firstTopic; //defined in topics.ts
var lastTopicString; //defined in topics.ts
const linkTransitiontime = 500 //ms

// ABSRTACTION FUNCTIONS --------------------------
function getIcon(extraInfo){
	let newIcon = null;
	if (extraInfo.includes("SB")){
		extraInfo = extraInfo.replace("SB","");
		extraInfo = extraInfo.replace(" ","");

		newIcon = document.createElement("i");
		newIcon.classList.add("fa");
		newIcon.classList.add("fa-book");
		newIcon.title = "summarized book";
		
		sectionEl.appendChild(newIcon);
	}
	else if (extraInfo.includes("A")){
		extraInfo = extraInfo.replace("A","");
		extraInfo = extraInfo.replace(" ","");

		newIcon = document.createElement("i");
		newIcon.classList.add("fa");
		newIcon.classList.add("fa-volume-up");
		newIcon.title = "summarized audio";
		
		sectionEl.appendChild(newIcon);
	}
	return newIcon;
}

function addLink(href, text, newIcon) {
	let anchor = document.createElement("a");
	anchor.href = href;
	anchor.textContent = text;

	let newP = document.createElement("p");
	if (newIcon) newP.appendChild(newIcon);
	newP.appendChild(anchor);

	sectionEl.appendChild(newP);
}

function placeH2(curTopic){
	let newH2 = document.createElement("h2");
	newH2.textContent = curTopic.replaceAll("_"," ");
	sectionEl.appendChild(newH2);
}

function setLinksStep2(){
	sectionEl.innerHTML = '';
	var toSearch = document.getElementById("sinput").value.toLowerCase().replaceAll("_"," ");
	var summaryId, extraInfo;
	var curTopic = firstTopic;
	while (curTopic !== lastTopicString){
		if (curTopic.toLowerCase().replaceAll("_"," ").includes(toSearch)) {
			placeH2(curTopic);
			topics[curTopic].forEach((subTopicInfo, i)=>{
				if(i == 0) return; //first index is not about subtopic
				summaryId = subTopicInfo[0];
				extraInfo = subTopicInfo[1];
				let anchorHref = `${curTopic}/${summaryId}`;
				let anchorText = `${summaryId.replaceAll("_"," ")} ${extraInfo}`;
				let icon = getIcon(extraInfo);
				addLink(anchorHref, anchorText, icon);
			});
		}
		else {
			let h2Placed = false;
			topics[curTopic].forEach((subTopicInfo, i)=>{
				if(i == 0) return; //first index is not about subtopic
				summaryId = subTopicInfo[0];
				extraInfo = subTopicInfo[1];

				if (
					extraInfo.toLowerCase().replaceAll("_"," ").includes(toSearch) ||
					summaryId.toLowerCase().replaceAll("_"," ").includes(toSearch)
				) {
					if (!h2Placed) {
						placeH2(curTopic);
						h2Placed = true;
					}

					const anchorHref = `${curTopic}/${summaryId}`;
					const anchorText = `${summaryId.replaceAll("_"," ")} ${extraInfo}`;
					addLink(anchorHref, anchorText, getIcon(extraInfo));
				}
			})
		};

		curTopic = topics[curTopic][0];
	}

	if (!sectionEl.childElementCount) sectionEl.appendChild(notFoundEl);
	sectionEl.style.opacity = 1;
	window.setTimeout(()=>{ allowSearchClick = true; }, linkTransitiontime);
}

function setLinks(){
	sectionEl.style.opacity = 0;
	window.setTimeout(()=>{ setLinksStep2(); }, linkTransitiontime);
}

// START FUNC --------------------------------------------
window.onload = ()=>{
	sectionEl = document.getElementById("links");

	notFoundEl.setAttribute("id","notFound");
	notFoundEl.textContent = "Either what you are looking for doesn't exist, or you may have misspelled something.";

	setLinks();
}

// EVENT FUNCTIONS ----------------------------------------------
function searchClicked(){ 
	if (!allowSearchClick) return;
	allowSearchClick = false;
	setLinks();
}

function sinputKeyUp(event){
	if (event.key === "Enter")
		searchClicked();
}
