import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

/** 
 * Middleware de depuración que imprime información detallada de las solicitudes HTTP
*/
export const debugRequestMiddleware = (request: Request, response: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
    const start = Date.now();

    logger.debug(`📥 INCOMING REQUEST: ${request.method} ${request.url}`)
    logger.debug(`📋 Header: ${JSON.stringify(request.headers, null, 2)}`);

    if (request.body && Object.keys(request.body).length > 0) {
      const sanitizedBody = { ...request.body}

      if (sanitizedBody.password) sanitizedBody.password = '********';
      if (sanitizedBody.token) sanitizedBody.token = '********';

      logger.debug(`📦 Request Body: ${JSON.stringify(sanitizedBody, null, 2)}`);
    }

    if (request.params && Object.keys(request.params).length > 0) {
      logger.debug(`🔍 Route Params: ${JSON.stringify(request.params, null, 2)}`);
    }

    if (request.query && Object.keys(request.query).length > 0) {
      logger.debug(`❓ Query Params: ${JSON.stringify(request.query, null, 2)}`);
    }

    const originalSend = response.send;

    response.send = function(body): Response {
      const duration = Date.now() - start;

      let responseBody;

      try {
        if (typeof body === 'string') {
          responseBody = JSON.parse(body);
        } else {
          responseBody = body;
        }

      } catch (error) {
        responseBody = body;
      }

      logger.debug(`📤 OUTGOING RESPONSE (${duration}ms): ${response.statusCode}`);
      logger.debug(`📦 Response Body: ${JSON.stringify(responseBody, null, 2)}`);

      return originalSend.call(response, body);
    }
  }
  next();
}