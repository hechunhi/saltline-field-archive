import { resolve, sep } from "node:path";

const root = import.meta.dir;
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: Number(process.env.PORT ?? 3000),
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405 });
    }
    let pathname: string;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return new Response("Bad request", { status: 400 });
    }
    const path = resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!path.startsWith(root + sep)) return new Response("Forbidden", { status: 403 });
    const file = Bun.file(path);
    if (!(await file.exists())) return new Response("Not found", { status: 404 });
    return new Response(request.method === "HEAD" ? null : file, {
      headers: { "Content-Type": file.type, "Cache-Control": "no-store" },
    });
  },
});

console.log(`Saltline läuft auf ${server.url}`);
