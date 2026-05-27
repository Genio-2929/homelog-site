const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { createClient } = require("@supabase/supabase-js");

const root = __dirname;
const dataDir = path.join(root, "data");
const seedReviewsPath = path.join(dataDir, "seed-reviews.json");
const port = Number(process.env.PORT || 8001);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const REPORT_REASONS = ["misinformation", "personal_info", "harassment", "spam", "other"];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function readSeedReviews() {
  try {
    if (!fs.existsSync(seedReviewsPath)) return [];
    const parsed = JSON.parse(fs.readFileSync(seedReviewsPath, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

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

function normalizeReport(input) {
  const reviewId = String(input.reviewId || "").trim();
  const reason = String(input.reason || "").trim();
  if (!reviewId || !REPORT_REASONS.includes(reason)) return null;
  return {
    id: `report-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    review_id: reviewId,
    reason,
    note: String(input.note || "").slice(0, 500),
    reporter: String(input.reporter || "anonymous").slice(0, 80),
    status: "open",
    created_at: new Date().toISOString(),
  };
}

function reportToFrontend(row) {
  return {
    id: row.id,
    reviewId: row.review_id,
    reason: row.reason,
    note: row.note,
    reporter: row.reporter,
    status: row.status,
    createdAt: row.created_at,
  };
}

function normalizeHostReply(input) {
  const reviewId = String(input.reviewId || "").trim();
  const text = String(input.text || "").trim();
  const hostId = Number(input.hostId);
  if (!reviewId || !text || !Number.isFinite(hostId)) return null;
  return {
    review_id: reviewId,
    host_id: hostId,
    host_name: String(input.hostName || "Host family").slice(0, 80),
    text: text.slice(0, 800),
    created_at: new Date().toISOString(),
  };
}

function replyRowToFrontend(row) {
  return {
    text: row.text,
    hostId: row.host_id,
    hostName: row.host_name,
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

    const userReviews = (data || []).map(toFrontend);
    const seedReviews = readSeedReviews();
    sendJson(response, 200, [...userReviews, ...seedReviews]);
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
        console.error("[POST /api/reviews] Supabase error:", JSON.stringify(error));
        sendJson(response, 500, { error: "Failed to save review", detail: error.message });
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

    if (reviewId.startsWith("seed-")) {
      sendJson(response, 403, { error: "Seed reviews are managed via seed-reviews.json" });
      return;
    }

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

  // ------------------------------------------------------------------
  // Reports — moderator-visible report queue (task #2)
  // ------------------------------------------------------------------
  if (pathname === "/api/reports" && request.method === "GET") {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/reports] Supabase error:", JSON.stringify(error));
      sendJson(response, 500, { error: "Failed to load reports" });
      return;
    }

    sendJson(response, 200, (data || []).map(reportToFrontend));
    return;
  }

  if (pathname === "/api/reports" && request.method === "POST") {
    try {
      const body = await readBody(request);
      const report = normalizeReport(JSON.parse(body || "{}"));
      if (!report) {
        sendJson(response, 400, { error: "Invalid report" });
        return;
      }

      const { data, error } = await supabase
        .from("reports")
        .insert(report)
        .select()
        .single();

      if (error) {
        console.error("[POST /api/reports] Supabase error:", JSON.stringify(error));
        sendJson(response, 500, { error: "Failed to save report", detail: error.message });
        return;
      }

      sendJson(response, 201, reportToFrontend(data));
    } catch (_error) {
      sendJson(response, 400, { error: "Invalid request" });
    }
    return;
  }

  // ------------------------------------------------------------------
  // Host replies — one reply per review, only the host bound to that
  // host_id may post (task #7)
  // ------------------------------------------------------------------
  if (pathname === "/api/host-replies" && request.method === "GET") {
    const { data, error } = await supabase
      .from("host_replies")
      .select("*");

    if (error) {
      console.error("[GET /api/host-replies] Supabase error:", JSON.stringify(error));
      sendJson(response, 500, { error: "Failed to load replies" });
      return;
    }

    // Frontend expects an object keyed by reviewId for fast lookup
    const map = {};
    (data || []).forEach((row) => {
      map[row.review_id] = replyRowToFrontend(row);
    });
    sendJson(response, 200, map);
    return;
  }

  if (pathname === "/api/host-replies" && request.method === "POST") {
    try {
      const body = await readBody(request);
      const parsed = JSON.parse(body || "{}");
      const reply = normalizeHostReply(parsed);
      if (!reply) {
        sendJson(response, 400, { error: "Invalid reply" });
        return;
      }

      // Confirm the target review exists and its host_id matches the reply's host_id
      let targetReview = null;
      if (!String(parsed.reviewId).startsWith("seed-")) {
        const { data: reviewRow } = await supabase
          .from("reviews")
          .select("host_id")
          .eq("id", parsed.reviewId)
          .maybeSingle();
        targetReview = reviewRow;
      } else {
        // Seed reviews: look up host_id from the seed JSON
        const seedRow = readSeedReviews().find((r) => String(r.id) === String(parsed.reviewId));
        if (seedRow) targetReview = { host_id: Number(seedRow.hostId) };
      }

      if (!targetReview) {
        sendJson(response, 404, { error: "Review not found" });
        return;
      }
      if (Number(targetReview.host_id) !== reply.host_id) {
        sendJson(response, 403, { error: "Not authorized to reply to this review" });
        return;
      }

      // Upsert (one reply per review)
      const { data, error } = await supabase
        .from("host_replies")
        .upsert(reply, { onConflict: "review_id" })
        .select()
        .single();

      if (error) {
        console.error("[POST /api/host-replies] Supabase error:", JSON.stringify(error));
        sendJson(response, 500, { error: "Failed to save reply", detail: error.message });
        return;
      }

      sendJson(response, 201, replyRowToFrontend(data));
    } catch (_error) {
      sendJson(response, 400, { error: "Invalid request" });
    }
    return;
  }

  serveStatic(request, response, decodeURIComponent(pathname));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Nestly server running at http://0.0.0.0:${port}/`);
});
