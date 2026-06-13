import {firstTopic, lastTopicString, topics} from './topics.ts';

export const specialFiles: {[key:string]: (content: string) => string} = {
  "./pageScripts/home.js": (content) => homejsCase(content),
};

function homejsCase(content: string): string {
  return `
  ${content}
  topics = ${JSON.stringify(topics)};
  firstTopic = "${firstTopic}";
  lastTopicString = "${lastTopicString}";
  `
}
