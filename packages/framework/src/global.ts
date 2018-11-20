import express from 'express';
import { IncomingMessage, ServerResponse } from 'http';

export const app = express();

export interface ContextArguments {
  req: IncomingMessage;
  res: ServerResponse;
}

export const contextMap: Map<string, (args: ContextArguments) => any> = new Map();
