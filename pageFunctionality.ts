import { IncomingMessage, ServerResponse } from 'node:http';
import { return500 } from './errors';
import { readFileSync } from 'node:fs';

//COMPLETE THIS
export function formStuff(req: IncomingMessage, res: ServerResponse<IncomingMessage>){
  try{
    let body = '';
    req.on('data', (data) => { body += data; });
    req.on('end', () => { 
      let postData = JSON.parse(body); 
      console.log(postData);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end("Response Successful");
    });
  }
  catch { return500(res); }
}

export function sendChapterContent(req: IncomingMessage, res: ServerResponse<IncomingMessage>){
  try {
    let body = '';
    req.on('data', (data) => { body += data; });
    req.on('end', async () => {      
      try {
        let postData = JSON.parse(body);
        let sendContent = "FILE_NOT_FOUND";
        
        const possiblePath = [
          `./pageContents/${postData.loc}/chpt${postData.num}/0.html`,
          `./pageContents/${postData.loc}/${postData.name}.html`,
          `./pageContents/${postData.loc}/${postData.num}.html`
        ];

        for (let path of possiblePath) {
          try {
            sendContent = readFileSync(path, 'utf8');
            break;
          }
          catch{}
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain'); //text/html is intentionally avoided
        res.end(sendContent);
      }
      catch { return500(res); }
    });
  }
  catch { return500(res); }
}

export function sendVerses(req: IncomingMessage, res: ServerResponse<IncomingMessage>){
  try{
    let body = '';
    req.on('data', (data) => { body += data; });
    req.on('end', () => { 
      try {
        let postData = JSON.parse(body); 
        let resArr = [];
        for (let verse of postData) {
          let split = verse.split(":");
          let surah = readFileSync(`./quran/surah_${split[0]}.json`, 'utf8');
          if (split[1].includes("-")) {
            let content = "";
            let startEnd = split[1].split("-");
            for(let i = startEnd[0]; i<=startEnd[1]; i++) {
              content += JSON.parse(surah)["verse"][`verse_${i}`] + "۞ ";
            }
            resArr.push(content);
          }
          else resArr.push(JSON.parse(surah)["verse"][`verse_${split[1]}`] + "۞ ");
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(resArr));
      }
      catch { return500(res); }
    });
  }
  catch { return500(res); }
}

export function sendSubchapterContent(req: IncomingMessage, res: ServerResponse<IncomingMessage>){
  try {
    let body = '';
    req.on('data', (data) => { body += data; });
    req.on('end', () => { 
      try {
        let postData = JSON.parse(body);
        let sendContent = "FILE_NOT_FOUND";
        const possiblePath = [
          `./pageContents/${postData.loc}/chpt${postData.chapNum}/${postData.subChapNum}.html`,
          `./pageContents/${postData.loc}/${postData.chapName}/${postData.subChapNum}.html`,
          `./pageContents/${postData.loc}/chpt${postData.chapNum}/${postData.subchapterName}.html`,
          `./pageContents/${postData.loc}/${postData.chapName}/${postData.subchapterName}.html`
        ];

        for (let path of possiblePath) {
          try {
            sendContent = readFileSync(path, 'utf8');
            break;
          }
          catch{}
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain'); //text/html is intentionally avoided
        res.end(sendContent);
      }
      catch { return500(res); }
    });
  }
  catch { return500(res); }
}
