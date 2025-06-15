import { IncomingMessage, ServerResponse } from 'node:http';

export function return404(res: ServerResponse<IncomingMessage>){
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  res.end('<p>Not found</p>');
}

export function return500(res: ServerResponse<IncomingMessage>){
  res.statusCode = 500;
  res.setHeader('Content-Type', 'text/html');
  res.end('<p>Internal server error!</p>');
}