import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { checkRateLimit, getClientIp } from "./rate-limit.server";

export const aiRateLimitMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    const ip = getClientIp(request);
    const rl = checkRateLimit(`fn:${ip}`);
    if (!rl.ok) {
      throw new Response("Too many requests", {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfter) },
      });
    }
    return next();
  },
);
