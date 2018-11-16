import express from 'express';
import { IncomingMessage, ServerResponse } from 'http';

export const app = express();

export const contextMap: Map<string, (args: { req: IncomingMessage, res: ServerResponse }) => any> = new Map();
