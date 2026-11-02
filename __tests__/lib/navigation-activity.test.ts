import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { trackNavigationActivity } from "@/lib/navigation-activity";

const PAGE_LOAD = { headers: { RSC: "1" } };
const PREFETCH = { headers: { RSC: "1", "Next-Router-Prefetch": "1" } };
const SERVER_ACTION = { method: "POST", headers: { "Next-Action": "abc" } };

const flush = () => vi.advanceTimersByTimeAsync(0);

describe("trackNavigationActivity", () => {
  const originalFetch = window.fetch;
  let serverFetch: ReturnType<typeof vi.fn>;
  let onChange: Mock<(active: boolean) => void>;
  let stop: () => void;

  beforeEach(() => {
    vi.useFakeTimers();
    serverFetch = vi.fn(async () => new Response("payload"));
    window.fetch = serverFetch as unknown as typeof fetch;
    onChange = vi.fn<(active: boolean) => void>();
    stop = trackNavigationActivity(onChange);
  });

  afterEach(() => {
    stop();
    window.fetch = originalFetch;
    vi.useRealTimers();
  });

  it("should report activity for a page load right after a click", async () => {
    document.body.click();

    const pending = window.fetch("/products", PAGE_LOAD);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(true);
    await pending;
    await flush();
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("should report activity for a server action right after a form submit", async () => {
    document.body.dispatchEvent(new Event("submit", { bubbles: true }));

    await window.fetch("", SERVER_ACTION);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("should report activity for a page load after browser back or forward", async () => {
    window.dispatchEvent(new PopStateEvent("popstate"));

    await window.fetch("/products", PAGE_LOAD);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("should stay active until the response body has fully arrived", async () => {
    let finishBody = () => {};
    const body = new ReadableStream({
      start(controller) {
        finishBody = () => controller.close();
      },
    });
    serverFetch.mockResolvedValueOnce(new Response(body));
    document.body.click();

    await window.fetch("/products", PAGE_LOAD);
    await flush();
    expect(onChange).not.toHaveBeenCalledWith(false);

    finishBody();
    await flush();
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("should ignore background polling with no recent user action", async () => {
    document.body.click();
    await vi.advanceTimersByTimeAsync(5000);

    await window.fetch("", SERVER_ACTION);
    await window.fetch("/orders/1", PAGE_LOAD);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("should ignore prefetches even right after a click", async () => {
    document.body.click();

    await window.fetch("/products", PREFETCH);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("should ignore ordinary fetches even right after a click", async () => {
    document.body.click();

    await window.fetch("/api/search");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("should track a refresh that follows a slow save", async () => {
    document.body.click();
    await vi.advanceTimersByTimeAsync(500);
    let finishSave: (response: Response) => void = () => {};
    serverFetch.mockReturnValueOnce(new Promise((resolve) => (finishSave = resolve)));
    const save = window.fetch("", SERVER_ACTION);
    await vi.advanceTimersByTimeAsync(5000);
    finishSave(new Response("saved"));
    await save;
    await flush();
    onChange.mockClear();

    await window.fetch("/orders", PAGE_LOAD);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("should report one activity across overlapping requests", async () => {
    let finishFirst: (response: Response) => void = () => {};
    serverFetch.mockReturnValueOnce(new Promise((resolve) => (finishFirst = resolve)));
    document.body.click();

    const first = window.fetch("/a", PAGE_LOAD);
    await window.fetch("/b", PAGE_LOAD);
    await flush();

    expect(onChange).toHaveBeenCalledTimes(1);
    finishFirst(new Response("a"));
    await first;
    await flush();
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("should end activity and rethrow when the request fails", async () => {
    serverFetch.mockRejectedValueOnce(new TypeError("offline"));
    document.body.click();

    await expect(window.fetch("/products", PAGE_LOAD)).rejects.toThrow("offline");

    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("should end activity when the response body is aborted", async () => {
    let failBody = () => {};
    const body = new ReadableStream({
      start(controller) {
        failBody = () => controller.error(new Error("aborted"));
      },
    });
    serverFetch.mockResolvedValueOnce(new Response(body));
    document.body.click();

    const response = await window.fetch("/products", PAGE_LOAD);
    void response.text().catch(() => {});
    failBody();
    await flush();

    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("should leave the response readable for the caller", async () => {
    document.body.click();

    const response = await window.fetch("/products", PAGE_LOAD);

    await expect(response.text()).resolves.toBe("payload");
  });

  it("should read request headers from a Request object", async () => {
    document.body.click();

    await window.fetch(new Request("http://localhost/products", PAGE_LOAD));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it.each(["change", "input"])("should report activity for a page load right after a %s event", async (eventType) => {
    document.body.dispatchEvent(new Event(eventType, { bubbles: true }));

    await window.fetch("/products", PAGE_LOAD);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("should restore fetch and stop listening when stopped", async () => {
    stop();

    document.body.click();
    await window.fetch("/products", PAGE_LOAD);

    expect(window.fetch).toBe(serverFetch);
    expect(onChange).not.toHaveBeenCalled();
  });
});
