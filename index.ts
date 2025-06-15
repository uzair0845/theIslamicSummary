import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { readFileSync } from 'node:fs';
import { return404, return500 } from './errors';
import { specialFiles } from './specialFiles';
import { formStuff, sendChapterContent, sendVerses, sendSubchapterContent } from './pageFunctionality';
import evalArticlePage from './evalArticlePage';
import { topics} from './topics';

const hostname = '0.0.0.0';
const port = process.env.PORT || 6236;

function readFileAndSendRes(res: ServerResponse<IncomingMessage>, fileName: string, responseType: string, encoding?: BufferEncoding){
  try{
    let content = encoding ? readFileSync(fileName, encoding) : readFileSync(fileName);
    res.statusCode = 200;
    res.setHeader('Content-Type', responseType);
    if (fileName in specialFiles && typeof(content)==="string") content = specialFiles[fileName](content);
    res.end(content);
  }
  catch(e){
    if ((e instanceof Object) && ('code' in e) && (e['code'] === 'ENOENT')) return404(res);
    else return500(res);
  }
}

async function checkMakeSendPage(subDirectories: string[], res: ServerResponse<IncomingMessage>){
  if (subDirectories.length !== 3) return404(res); // 3 because ''/topic/subtopic 
  else {
    let topic = subDirectories[1];
    let subTopic = subDirectories[2];
    if (
      (topic in topics) &&
      topics[topic].some((subTopicInfo)=> subTopic == subTopicInfo[0])
    ) {
      let articleContent = await evalArticlePage(topic, subTopic);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(articleContent);
    }
    else return404(res);
  } 
}

const server = createServer(async (req, res) => {
  let qIndex = req.url?.indexOf('?') || -1;
  let location = qIndex > 0 ? req.url?.substring(0, qIndex) : req.url;
  //console.log(req.url);

  //assist files
  if (!location) return500(res);
  else if (location?.includes(".js")) readFileAndSendRes(res, "." + location, 'text/javascript', 'utf8');
  else if (location?.includes(".css")) readFileAndSendRes(res, "." + location, 'text/css', 'utf8');
  else if (location?.includes(".png")) readFileAndSendRes(res, "." + location, 'image/png');
  else if (location?.includes(".gif")) readFileAndSendRes(res, "." + location, 'image/gif');
  else if (location?.includes(".ico")) readFileAndSendRes(res, "." + location, 'image/vnd.microsoft.icon');
  else if (location?.includes("contactResponse")) formStuff(req, res);
  else if (location?.includes("getChapterContent")) sendChapterContent(req, res);
  else if (location?.includes("getVerse")) sendVerses(req, res);
  else if (location?.includes("getSubchapterContent")) sendSubchapterContent(req, res);
  //pages
  else if (location == "/") readFileAndSendRes(res, './pageContents/home.html', 'text/html', 'utf8');
  else if (location == "/contact") readFileAndSendRes(res, './pageContents/contact.html', 'text/html', 'utf8');
  else if (location == "/fonts") readFileAndSendRes(res, './pageContents/fonts.html', 'text/html', 'utf8');
  else checkMakeSendPage(location.split('/'), res); //assume user is in article page and is trying to access a chapter
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});