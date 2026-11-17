/**
 * api/_lib/http.js — small helpers shared by every API route.
 *
 * Routes only use plain Node request/response objects, so the same code runs
 * as a Vercel function and under the local dev server (see vite.config.js).
 */

import { NotConfiguredError } from './db.js';

const MAX_BODY_BYTES = 600_000;

/** An error whose message is safe to show to the user. */
export class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

export function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

/** Parse the JSON body. Vercel may already have parsed it into req.body. */
export async function readJson(req) {
  let raw = req.body;

  if (raw === undefined) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) throw new HttpError(413, 'That request is too large.');
      chunks.push(chunk);
    }
    raw = Buffer.concat(chunks).toString('utf8');
  }

  if (Buffer.isBuffer(raw)) raw = raw.toString('utf8');
  if (typeof raw === 'string') {
    if (raw.length > MAX_BODY_BYTES) throw new HttpError(413, 'That request is too large.');
    try {
      raw = raw ? JSON.parse(raw) : {};
    } catch {
      throw new HttpError(400, 'The request body is not valid JSON.');
    }
  }
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) throw new HttpError(400, 'Expected a JSON object.');
  return raw;
}

export function readCookie(req, name) {
  for (const part of (req.headers.cookie || '').split(';')) {
    const at = part.indexOf('=');
    if (at !== -1 && part.slice(0, at).trim() === name) return decodeURIComponent(part.slice(at + 1).trim());
  }
  return null;
}

/** True when the request reached us over HTTPS (Vercel terminates TLS in front). */
export const isHttps = (req) => (req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';

/** The caller's IP address, for rate limiting. */
export function clientIp(req) {
  const forwarded = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
}

/**
 * Wrap a route: pick the handler for the HTTP method, apply the cross-site
 * checks, and turn thrown errors into JSON responses.
 *
 *   export default route({ GET: async (req, res) => { ... }, PUT: ... });
 *
 * @param {Record<string, (req: any, res: any) => Promise<void>>} handlers
 */
export function route(handlers) {
  return async function handler(req, res) {
    try {
      const run = handlers[req.method];
      if (!run) {
        res.setHeader('Allow', Object.keys(handlers).join(', '));
        throw new HttpError(405, 'Method not allowed.');
      }

      if (req.method !== 'GET') {
        // Requests that change something must come from our own pages. A JSON
        // content type cannot be sent cross-site without a CORS preflight
        // (which we never approve), and the Origin must match the host.
        if (!(req.headers['content-type'] || '').startsWith('application/json')) throw new HttpError(415, 'Send JSON.');
        const origin = req.headers.origin;
        if (origin && !URL.canParse(origin)) throw new HttpError(403, 'Cross-site requests are not allowed.');
        if (origin && new URL(origin).host !== req.headers.host) throw new HttpError(403, 'Cross-site requests are not allowed.');
      }

      await run(req, res);
    } catch (err) {
      if (err instanceof HttpError) return send(res, err.status, { error: err.message, ...err.extra });
      if (err instanceof NotConfiguredError) return send(res, 503, { error: 'Accounts are not set up on this deployment.', notConfigured: true });
      console.error('[api]', req.method, req.url, err);
      return send(res, 500, { error: 'Something went wrong on the server. Please try again.' });
    }
  };
}
