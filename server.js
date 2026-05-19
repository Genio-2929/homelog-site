const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { createClient } = require("@supabase/supabase-js");

const root = __dirname;
const port = Number(process.env.PORT || 8001);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function normalizeReview(input) {
  const text = String(input.text || "").trim();
  const host = String(input.host || "").trim();
  const hostId = Number(input.hostId);
  const score = Number(input.score);

  if (!host || !Number.isFinite(hostId) || !Number.isFinite(score)) {
    return null;
  }

  return {
    id: `server-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    host_id: hostId,
    host,
    student: String(input.student || "anonymous").slice(0, 80),
    text: text.slice(0, 1200),
    score: Math.max(1, Math.min(5, score)),
    criteria: typeof input.criteria === "object" && input.criteria ? input.criteria : {},
    fit: Array.isArray(input.fit) ? input.fit.map(String).slice(0, 8) : [],
    structured: typeof input.structured === "object" && input.structured ? input.structured : {},
    created_at: new Date().toISOString(),
  };
}

function toFrontend(row) {
  return {
    id: row.id,
    hostId: row.host_id,
    host: row.host,
    student: row.student,
    text: row.text,
    score: row.score,
    criteria: row.criteria || {},
    fit: row.fit || [],
    structured: row.structured || {},
    createdAt: row.created_at,
  };
}

function serveStatic(request, response, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(root, safePath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
    });
    response.end(content);
  });
}

const server = http.createServer(async (request, response) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);

  if (pathname === "/api/reviews" && request.method === "GET") {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      sendJson(response, 500, { error: "Failed to load reviews" });
      return;
    }

    sendJson(response, 200, (data || []).map(toFrontend));
    return;
  }

  if (pathname === "/api/reviews" && request.method === "POST") {
    try {
      const body = await readBody(request);
      const review = normalizeReview(JSON.parse(body || "{}"));
      if (!review) {
        sendJson(response, 400, { error: "Invalid review" });
        return;
      }

      const { data, error } = await supabase
        .from("reviews")
        .insert(review)
        .select()
        .single();

      if (error) {
        sendJson(response, 500, { error: "Failed to save review" });
        return;
      }

      sendJson(response, 201, toFrontend(data));
    } catch (_error) {
      sendJson(response, 400, { error: "Invalid request" });
    }
    return;
  }

  if (pathname.startsWith("/api/reviews/") && request.method === "DELETE") {
    const reviewId = decodeURIComponent(pathname.slice("/api/reviews/".length));

    const { error, count } = await supabase
      .from("reviews")
      .delete({ count: "exact" })
      .eq("id", reviewId);

    if (error) {
      sendJson(response, 500, { error: "Failed to delete review" });
      return;
    }

    if (count === 0) {
      sendJson(response, 404, { error: "Review not found" });
      return;
    }

    sendJson(response, 200, { ok: true });
    return;
  }

  serveStatic(request, response, decodeURIComponent(pathname));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`ホームログ server running at http://0.0.0.0:${port}/`);
});
