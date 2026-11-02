// Next.js only exposes per-link pending state, so the one place that sees every
// page load and server action is fetch. Its RSC requests carry these headers.
const USER_ACTION_WINDOW_MS = 1000;
// File pickers, dropdowns and search boxes act on change/input, not on a click.
const USER_ACTION_EVENTS = ["click", "submit", "change", "input"];

type ActivityListener = (active: boolean) => void;

function isPageLoadOrServerAction(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
  if (headers.has("next-action")) return true;
  return headers.has("rsc") && !headers.has("next-router-prefetch");
}

export function trackNavigationActivity(onChange: ActivityListener): () => void {
  const originalFetch = window.fetch;
  let inFlight = 0;
  let lastUserAction = Number.NEGATIVE_INFINITY;

  const markUserAction = () => {
    lastUserAction = Date.now();
  };

  // Settling counts as a user action so that the router.refresh() following a
  // slow save is still tracked, while timers polling in the background are not.
  const settle = () => {
    markUserAction();
    inFlight -= 1;
    if (inFlight === 0) onChange(false);
  };

  const begin = () => {
    inFlight += 1;
    if (inFlight === 1) onChange(true);
  };

  const isUserTriggered = () => inFlight > 0 || Date.now() - lastUserAction <= USER_ACTION_WINDOW_MS;

  const trackedFetch: typeof fetch = async (input, init) => {
    if (!isPageLoadOrServerAction(input, init) || !isUserTriggered()) {
      return originalFetch.call(window, input, init);
    }

    begin();

    try {
      const response = await originalFetch.call(window, input, init);
      // Headers arrive long before a streamed page does, so wait for the body.
      void response.clone().arrayBuffer().catch(() => undefined).finally(settle);
      return response;
    } catch (error) {
      settle();
      throw error;
    }
  };

  window.fetch = trackedFetch;
  USER_ACTION_EVENTS.forEach((type) => document.addEventListener(type, markUserAction, true));
  window.addEventListener("popstate", markUserAction);

  return () => {
    window.fetch = originalFetch;
    USER_ACTION_EVENTS.forEach((type) => document.removeEventListener(type, markUserAction, true));
    window.removeEventListener("popstate", markUserAction);
  };
}
