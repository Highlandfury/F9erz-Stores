import { serve } from "inngest/next";
import { inngest, syncUsercreation, syncUserUpdation, syncUserDeletion } from "@/config/inngest";

// Defensive: the Inngest SDK or our exports may be undefined during build-time.
// Only call `serve` when we have a client and at least one function. Otherwise
// export no-op handlers so Next's page data collection doesn't fail.
const functions = [syncUsercreation, syncUserUpdation, syncUserDeletion].filter(Boolean);

let handlers;
if (typeof inngest !== "undefined" && functions.length > 0) {
  try {
  // `serve` expects (inngest, functions, opts). Passing an object made the
  // second argument undefined inside the SDK which caused a `.filter` on
  // `undefined` — leading to the runtime error. Pass the args positionally.
  handlers = serve(inngest, functions);
  } catch (err) {
    // If Inngest's serve throws during build-time, fall back to no-op handlers
    // so Next's page data collection can continue.
    // eslint-disable-next-line no-console
    console.warn("inngest serve() failed during build. Falling back to no-op handlers:", err?.message || err);
    const noop = async () => new Response(null, { status: 204 });
    handlers = { GET: noop, POST: noop, PUT: noop };
  }
} else {
  // No-op handlers: return 204 No Content for any incoming request
  const noop = async () => new Response(null, { status: 204 });
  handlers = { GET: noop, POST: noop, PUT: noop };
}

export const { GET, POST, PUT } = handlers;