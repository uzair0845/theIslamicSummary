import {firstTopic, postLastTopicMarker, topics} from './topics';

export const specialFiles: {[key:string]: (content: string) => string} = {
  "./pageScripts/home.js": (content) => homejsCase(content),
};

function homejsCase(content: string): string {
  return `
  ${content}
  topics = ${JSON.stringify(topics)};
  firstTopic = "${firstTopic}";
  postLastTopicMarker = "${postLastTopicMarker}";
  `
}
