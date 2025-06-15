import { promises } from 'node:fs';
import { existsSync } from 'node:fs';

export default async function evalArticlePage(topic: string, subTopic: string): Promise<string>{
  let page = await promises.readFile('./pageContents/pageTemplate.html','utf-8');
  let info = await import(`./pageContents/${topic}/${subTopic}/info.ts`);
  
  //info contains TITLE, SUBTITLE (optional), CHAPTERS, SOURCES (optional) and SOURCES_NAME (optional and needs SOURCES)
  const TITLE = info["TITLE"];
  const SUBTITLE = info["SUBTITLE"] as null | Array<string>;
  const CHAPTERS = info["CHAPTERS"] as string[][];
  const SOURCES = info["SOURCES"] as null | string[];
  const SOURCES_NAME = info["SOURCES_NAME"] as null | string[];

  page = page.replaceAll('%TITLE%', TITLE);
  
  if (SUBTITLE) {
    let h2Text = "";
    SUBTITLE.forEach((text)=>{
      h2Text += `<span>${text}</span>`;
      h2Text += "<br/>";
    })
    page = page.replace('%SUBTITLE%', `<h2>${h2Text}</h2>`);
  }
  else page = page.replace('%SUBTITLE%', '<h2>&nbsp;</h2>');

  var headerContent = "";
  CHAPTERS.forEach((chapterInfoArr, i)=>{
    if (!chapterInfoArr.length) throw Error(`Error in ${topic}/${subTopic}: ChapterInfoArr should be at least 1.`);
    let chapterName = chapterInfoArr[0].replaceAll("_"," ");
    let buttonText = (chapterName.length > 50) ? (chapterName.substring(0, 50) + "...") : (chapterName);
    headerContent += `<button type='button' class='imageButton' title='${chapterName}' onclick="headerButtonClicked(${i})">${buttonText}</button>`;
  });
  page = page.replace("%HEADER_CONTENT%", headerContent);
  page = page.replace("%CHAPTERS%", JSON.stringify(CHAPTERS).replaceAll('\\"','\\\\"')); //stringify turns " into \", when it should be \\".

  let sourceBlockContent = "";
  if (SOURCES) {
    let pText = (SOURCES.length == 1) ? "Check the source" : "Check the sources";
    sourceBlockContent += `<div id="sourceBlock"><p>${pText}</p><div id="listS"><ul>`;
    if (SOURCES_NAME) 
      for (let i = 0; i < SOURCES.length; i++)
        sourceBlockContent += `<li><a target="_blank" href="${SOURCES[i]}">${SOURCES_NAME[i]}</a></li>`;
    else 
      for (let i = 0; i < SOURCES.length; i++)
        sourceBlockContent += `<li><a target="_blank" href="${SOURCES[i]}">${SOURCES[i]}</a></li>`;
    sourceBlockContent += `</ul></div></div>`;
  }
  page = page.replace("%SOURCE_BLOCK_CONTENT%", sourceBlockContent);

  let footerContent = "<a href='/'>Back To Home Page</a><a href='/contact'>Contact Us</a>";
  if (existsSync(`./pageContents/${topic}/${subTopic}/test.html`)) footerContent += `<a>Test Yourself</a>`;
  page = page.replace("%FOOTER_CONTENT%", footerContent);

  return page;
}