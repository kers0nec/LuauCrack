const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT id, name, language, description, views, created_at, updated_at,
            length(code) AS size
     FROM scripts ORDER BY created_at DESC LIMIT 500`
  ).all();
  return json({ ok: true, scripts: results });
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: "Invalid JSON" }, 400); }

  const name        = String(body.name || "").trim().slice(0, 120);
  const language    = String(body.language || "javascript").trim().slice(0, 40);
  const description = String(body.description || "").trim().slice(0, 500);
  const code        = String(body.code || "");

  if (!name)        return json({ ok: false, error: "Name is required" }, 400);
  if (!code.trim()) return json({ ok: false, error: "Code cannot be empty" }, 400);
  if (code.length > 500000) return json({ ok: false, error: "Code too large (max 500 KB)" }, 413);

  const res = await env.DB.prepare(
    "INSERT INTO scripts (name, language, description, code) VALUES (?, ?, ?, ?)"
  ).bind(name, language, description, code).run();

  return json({ ok: true, id: res.meta.last_row_id }, 201);
}
