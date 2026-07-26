const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

export async function onRequestGet({ params, env }) {
  const id = Number(params.id);
  const script = await env.DB.prepare("SELECT * FROM scripts WHERE id = ?").bind(id).first();
  if (!script) return json({ ok: false, error: "Not found" }, 404);
  await env.DB.prepare("UPDATE scripts SET views = views + 1 WHERE id = ?").bind(id).run();
  return json({ ok: true, script });
}

export async function onRequestPut({ request, params, env }) {
  const id = Number(params.id);
  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: "Invalid JSON" }, 400); }

  const exists = await env.DB.prepare("SELECT id FROM scripts WHERE id = ?").bind(id).first();
  if (!exists) return json({ ok: false, error: "Not found" }, 404);

  const fields = [], vals = [];
  for (const k of ["name", "language", "description", "code"]) {
    if (body[k] !== undefined) { fields.push(`${k} = ?`); vals.push(String(body[k])); }
  }
  if (!fields.length) return json({ ok: false, error: "Nothing to update" }, 400);
  fields.push("updated_at = datetime('now')");
  vals.push(id);
  await env.DB.prepare(`UPDATE scripts SET ${fields.join(", ")} WHERE id = ?`).bind(...vals).run();
  return json({ ok: true, id });
}

export async function onRequestDelete({ params, env }) {
  const res = await env.DB.prepare("DELETE FROM scripts WHERE id = ?").bind(Number(params.id)).run();
  if (res.meta.changes === 0) return json({ ok: false, error: "Not found" }, 404);
  return json({ ok: true });
}
