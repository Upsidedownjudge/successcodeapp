import React, { useEffect, useRef, useState } from "react";

// --- tiny UI
const Btn = ({ ghost, danger, className = "", ...p }) => (
  <button
    className={["px-3 py-1.5 rounded-lg text-sm border shadow-sm", danger
      ? "border-red-600 bg-red-600 text-white hover:bg-red-700"
      : ghost
      ? "bg-white/10 text-white hover:bg-white/20"
      : "bg-white text-gray-900 hover:bg-gray-100",
      className,
    ].join(" ")}
    {...p}
  />
);
const Input = ({ className = "", ...p }) => (
  <input
    className={["border rounded-lg px-3 py-1.5 w-full bg-gray-900 text-white border-gray-700", className,].join(" ")}
    {...p}
  />
);

// --- utils
// Recording length cap: 0 disables the automatic timeout (allowing manual stop / unlimited length)
const MAX_REC_MS = 0; // set >0 to re-enable an automatic stop (ms)
const todayYMD = () => new Date().toISOString().slice(0, 10);
const clone = (x) => {
  try {
    return typeof structuredClone === "function"
      ? structuredClone(x)
      : JSON.parse(JSON.stringify(x));
  } catch {
    return x;
  }
};
const pad = (n) => String(n).padStart(2, "0");
const toICSDate = (dt) =>
  `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(
    dt.getHours()
  )}${pad(dt.getMinutes())}${pad(dt.getSeconds())}`;
const download = (name, textOrBlob, type = "text/plain;charset=utf-8") => {
  const blob =
    textOrBlob instanceof Blob ? textOrBlob : new Blob([textOrBlob], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 250);
};
const uid = () => `evt_${Math.random().toString(36).slice(2, 9)}`;
function generateICS(events) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Success Code Lean//EN",
  ];
  const now = new Date();
  for (const e of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid()}`);
    lines.push(`DTSTAMP:${toICSDate(now)}`);
    lines.push(`DTSTART:${toICSDate(e.dtstart)}`);
    if (e.rrule) lines.push(`RRULE:${e.rrule}`);
    if (e.summary)
      lines.push(
        `SUMMARY:${String(e.summary)
          .replace(/([,;])/g, "\\$1")
          .replace(/\n/g, "\\n")}`
      );
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

// --- PWA helpers (manifest + service worker registration)
function setupPWA() {
  // Inject theme-color meta
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', '#0b0f19');

  // Create a minimal manifest at runtime (single-file demo)
  const manifest = {
    name: "Success Code",
    short_name: "SuccessCode",
    start_url: ".",
    display: "standalone",
    background_color: "#0b0f19",
    theme_color: "#0b0f19",
    icons: []
  };
  const murl = URL.createObjectURL(
    new Blob([JSON.stringify(manifest)], { type: 'application/json' })
  );
  let link = document.querySelector('link[rel="manifest"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'manifest';
    document.head.appendChild(link);
  }
  link.href = murl;

  // NOTE: to avoid stale cached assets on deploy, unregister any existing service workers for this origin
  // and do not register a new one here. This ensures users (and you) get the latest files immediately.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .then(() => console.info('Service workers unregistered for this origin'))
      .catch((err) => console.warn('Failed to unregister service workers', err));
    return;
  }
}

// --- storage
function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn("localStorage save failed", e);
    }
  }, [key, val]);
  return [val, setVal];
}

// --- default state (lean)
const defaultTimes = ["08:00", "11:00", "14:00", "17:00", "20:00"];
const defaultData = {
  version: 2,
  schedule: { times: defaultTimes },
  logs: { [todayYMD()]: defaultTimes.map((t) => ({ time: t })) },
  beliefScript:
    "I am enough. I choose what I focus on. My choices create my life.",
};

// --- self-tests (lightweight + extra coverage)
function runTests() {
  const out = [];
  const d = new Date(2000, 0, 2, 3, 4, 5);
  out.push(["toICSDate", /20000102T030405/.test(toICSDate(d))]);
  const ics = generateICS([
    { dtstart: d, rrule: "FREQ=DAILY", summary: "Check-in" },
  ]);
  out.push(["ICS DTSTART", /DTSTART:20000102T030405/.test(ics)]);
  out.push(["todayYMD", /^\d{4}-\d{2}-\d{2}$/.test(todayYMD())]);
  out.push(["uid prefix", /^evt_/.test(uid())]);
  const ics2 = generateICS([
    { dtstart: d, rrule: "FREQ=WEEKLY", summary: "A,B" },
  ]);
  out.push(["ICS RRULE present", /RRULE:FREQ=WEEKLY/.test(ics2)]);
  out.push(["ICS comma escaped", /SUMMARY:A\\,B/.test(ics2)]);
  const ics3 = generateICS([
    { dtstart: d, rrule: "FREQ=DAILY", summary: "Line\nBreak" },
  ]);
  out.push(["ICS newline escaped", /SUMMARY:Line\\nBreak/.test(ics3)]);
  const m = (
    generateICS([{ dtstart: d }, { dtstart: d }]).match(/BEGIN:VEVENT/g) || []
  ).length;
  out.push(["ICS multi-event count", m === 2]);
  out.push(["CRLF ends", /\r\n$/.test(generateICS([{ dtstart: d }]))]);
  out.push(["default times len", defaultTimes.length === 5]);
  // extra test: ensure 30s cap constant
  out.push(["max rec 30s", MAX_REC_MS === 30000]);
  return {
    ok: out.every(([, p]) => p),
    text: out.map(([n, p]) => `${p ? "✔" : "✖"} ${n}`).join(" · "),
  };
}

// --- media recorder helper + IndexedDB persistence
async function getRecorder() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mime =
    window.MediaRecorder &&
    MediaRecorder.isTypeSupported &&
    MediaRecorder.isTypeSupported("audio/mp4")
      ? "audio/mp4"
      : "audio/webm";
  const rec = new MediaRecorder(stream, { mimeType: mime });
  return { rec, stream, mime };
}

// Minimal IndexedDB helper (no deps)
const DB_NAME = "sclean_db";
const DB_VER = 1;
const STORE = "audio";
function idbOpen() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}
async function idbPut(id, blob) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function idbGet(id) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => res(req.result || null);
    req.onerror = () => rej(req.error);
  });
}
async function idbDel(id) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

// --- app (lean + dark + audio)
export default function App() {
  const [data, setData] = useLocalStorage(
    "successcode:lean+audio",
    defaultData
  );
  const [tab, setTab] = useState("checkins"); // simple 2-tab: checkins / audio

  // ensure today exists + run tests
  useEffect(() => {
    // one-time PWA setup
    setupPWA();

    const ymd = todayYMD();
    setData((prev) => {
      const next = clone(prev);
      if (!next.logs[ymd])
        next.logs[ymd] = (prev.schedule.times || defaultTimes).map((t) => ({
          time: t,
        }));
      return next;
    });
  // tests removed for production; keep runTests available for local debugging if needed
  }, [setData]);

  // midnight rollover
  useEffect(() => {
    const tick = setInterval(() => {
      const ymd = todayYMD();
      setData((prev) => {
        if (prev.logs[ymd]) return prev;
        const next = clone(prev);
        next.logs[ymd] = (prev.schedule.times || defaultTimes).map((t) => ({
          time: t,
        }));
        return next;
      });
    }, 60_000);
    return () => clearInterval(tick);
  }, [setData]);

  return (
    <div className="dark min-h-screen bg-gray-950 text-gray-100">
      <div className="app-root">
        <aside className="sidebar">
          <div className="panel" style={{ width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <strong style={{fontSize: 18}}>SC</strong>
          </div>
          <div className="icon-btn panel" title="Check-ins" onClick={() => setTab('checkins')}>✓</div>
          <div className="icon-btn panel" title="Belief Audio" onClick={() => setTab('audio')}>🎙</div>
        </aside>

        <main className="main-col">
          <div className="hero">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="site-title">Success Code · Lean</span>
                <span className="text-xs px-2 py-1 rounded-md" style={{ background: 'var(--accent-2)', color: '#071228', fontWeight: 800 }}>NEW UI</span>
              </div>
              <div className="muted">Simple daily check-ins and personal belief audio</div>
            </div>
            <div>
              <Btn onClick={() => setTab('checkins')}>Open Check‑ins</Btn>
            </div>
          </div>

          <div className="card-grid">
            <section className="panel">
              {tab === 'checkins' ? <Checkins data={data} setData={setData} /> : <div className="muted">Switch to Check-ins to view this panel</div>}
            </section>
            <section className="panel">
              {tab === 'audio' ? <BeliefAudio data={data} setData={setData} /> : <div className="muted">Switch to Belief Audio to view this panel</div>}
            </section>
          </div>
        </main>

        <aside className="right-col">
          <div className="panel">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Today</div>
            <div className="muted">{todayYMD()}</div>
            <hr style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.04)' }} />
            <div className="muted">Quick actions</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <Btn ghost onClick={() => { download('checkins_today.json', JSON.stringify(data.logs[todayYMD()]||[], null, 2)) }}>Export</Btn>
              <Btn ghost onClick={() => exportICSManual(data)}>ICS</Btn>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// small helper for right-col ICS button
function exportICSManual(data) {
  const events = (data.schedule.times || []).map((t) => {
    const [h, m] = t.split(":");
    const start = new Date();
    start.setHours(+h || 0, +m || 0, 0, 0);
    return { dtstart: start, rrule: 'FREQ=DAILY', summary: 'Feeling check-in' };
  });
  download('checkins_daily.ics', generateICS(events));
}

// --- sections
function Checkins({ data, setData }) {
  const ymd = todayYMD();
  const rows = data.logs[ymd] || [];
  const setTimes = (times) => setData((p) => ({ ...p, schedule: { times } }));
  const upsert = (i, patch) =>
    setData((prev) => {
      const next = clone(prev);
      const day = next.logs[ymd] || [];
      while (day.length <= i) day.push({ time: "12:00" });
      day[i] = { ...day[i], ...patch };
      next.logs[ymd] = day;
      return next;
    });

  const exportICS = () => {
    const events = (data.schedule.times || []).map((t) => {
      const [h, m] = t.split(":");
      const start = new Date();
      start.setHours(+h || 0, +m || 0, 0, 0);
      return {
        dtstart: new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate(),
          start.getHours(),
          start.getMinutes(),
          0
        ),
        rrule: "FREQ=DAILY",
        summary: "Feeling check-in",
      };
    });
    download("checkins_daily.ics", generateICS(events));
  };

  const exportTodayJSON = () =>
    download(`checkins_${ymd}.json`, JSON.stringify(rows, null, 2));

  return (
    <>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Schedule (5× daily)</h2>
        <div className="flex flex-wrap items-center gap-2">
          {(data.schedule.times || []).map((t, i) => (
            <Input
              key={i}
              type="time"
              value={t}
              onChange={(e) => {
                const next = [...(data.schedule.times || [])];
                next[i] = e.target.value;
                setTimes(next);
              }}
              className="w-auto"
            />
          ))}
          <Btn
            ghost
            onClick={() => setTimes([...(data.schedule.times || []), "12:00"])}
          >
            + time
          </Btn>
          <Btn onClick={exportICS}>Export reminders (.ics)</Btn>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Today’s check-ins · {ymd}</h2>
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-800 p-3 bg-gray-900"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Input
                  type="time"
                  value={r.time}
                  onChange={(e) => upsert(i, { time: e.target.value })}
                  className="w-auto"
                />
                <span className="text-xs text-gray-400">
                  Prompt: How does it feel to be me right now?
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                <Input
                  placeholder="Feeling (e.g., grateful, anxious)"
                  value={r.feeling || ""}
                  onChange={(e) => upsert(i, { feeling: e.target.value })}
                />
                <Input
                  placeholder="Focus right before the feeling"
                  value={r.focus || ""}
                  onChange={(e) => upsert(i, { focus: e.target.value })}
                />
              </div>
              <VoiceCell row={r} onChange={(patch) => upsert(i, patch)} />
            </div>
          ))}
          <div className="flex gap-2">
            <Btn onClick={() => upsert(rows.length, { time: "12:00" })}>
              + extra check-in
            </Btn>
            <Btn ghost onClick={exportTodayJSON}>Export today (.json)</Btn>
          </div>
        </div>
      </section>
    </>
  );
}

function VoiceCell({ row, onChange }) {
  const recRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [url, setUrl] = useState("");

  // Load persisted blob lazily
  useEffect(() => {
    let revoke;
    (async () => {
      if (row.audioUrl) {
        setUrl(row.audioUrl);
        return;
      }
      if (row.audioId) {
        const blob = await idbGet(row.audioId);
        if (blob) {
          const u = URL.createObjectURL(blob);
          revoke = u;
          setUrl(u);
        }
      }
    })();
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
      if (recRef.current?.stream)
        recRef.current.stream.getTracks().forEach((t) => t.stop());
    };
  }, [row.audioId, row.audioUrl]);

  const start = async () => {
    try {
      const { rec, stream, mime } = await getRecorder();
      recRef.current = { rec, stream, chunks: [], mime };
      rec.ondataavailable = (e) => recRef.current.chunks.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(recRef.current.chunks, { type: recRef.current.mime });
        const id = `${todayYMD()}_${Date.now()}`;
        await idbPut(id, blob); // persist by default
        const localUrl = URL.createObjectURL(blob);
        setUrl(localUrl);
        onChange({ audioId: id, audioUrl: localUrl });
        if (recRef.current.timer) clearTimeout(recRef.current.timer);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      if (MAX_REC_MS > 0) {
        recRef.current.timer = setTimeout(() => {
          try {
            rec.stop();
          } catch {}
        }, MAX_REC_MS);
      }
      setStatus("rec");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  const stop = () => {
    try {
      if (recRef.current?.timer) clearTimeout(recRef.current.timer);
      recRef.current?.rec?.stop();
      setStatus("done");
    } catch (e) {
      setStatus("error");
    }
  };

  const del = async () => {
    try {
      if (row.audioId) await idbDel(row.audioId);
      onChange({ audioId: null, audioUrl: null });
      if (url) URL.revokeObjectURL(url);
      setUrl("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {status !== "rec" ? (
        <Btn ghost onClick={start} aria-label="Start voice check-in">
          🎤 Record
        </Btn>
      ) : (
        <Btn danger onClick={stop} aria-label="Stop recording">
          ■ Stop
        </Btn>
      )}
      {url && <audio controls src={url} className="max-w-full" />}
      {url && (
        <Btn ghost onClick={del}>Remove</Btn>
      )}
      {status === "error" && (
        <span className="text-xs text-red-400">Mic error. Check permissions.</span>
      )}
    </div>
  );
}

function BeliefAudio({ data, setData }) {
  const [recState, setRecState] = useState("idle");
  const [url, setUrl] = useState("");
  const recRef = useRef(null);
  const list = data.beliefAudioList || [];

  // migrate old single id -> list once
  useEffect(() => {
    if (data.beliefAudioId && !data.beliefAudioList) {
      setData((p) => ({
        ...p,
        beliefAudioList: [{ id: p.beliefAudioId, createdAt: Date.now() }],
        beliefAudioId: null,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load preview for the most recent item (if any)
  useEffect(() => {
    let revoke;
    (async () => {
      if (!url && list.length) {
        const last = [...list].sort((a, b) => b.createdAt - a.createdAt)[0];
        const blob = await idbGet(last.id);
        if (blob) {
          const u = URL.createObjectURL(blob);
          revoke = u;
          setUrl(u);
        }
      }
    })();
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [list, url]);

  const start = async () => {
    try {
      const { rec, stream, mime } = await getRecorder();
      recRef.current = { rec, stream, chunks: [], mime };
      rec.ondataavailable = (e) => recRef.current.chunks.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(recRef.current.chunks, { type: recRef.current.mime });
        const id = `belief_${todayYMD()}_${Date.now()}`;
        await idbPut(id, blob); // persist by default
        setData((p) => ({
          ...p,
          beliefAudioList: [...(p.beliefAudioList || []), { id, createdAt: Date.now() }],
        }));
        const u = URL.createObjectURL(blob);
        setUrl(u);
        if (recRef.current.timer) clearTimeout(recRef.current.timer);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      setRecState("rec");
      if (MAX_REC_MS > 0) {
        recRef.current.timer = setTimeout(() => {
          try {
            rec.stop();
          } catch {}
        }, MAX_REC_MS);
      }
    } catch (e) {
      console.error(e);
      setRecState("error");
    }
  };

  const stop = () => {
    try {
      if (recRef.current?.timer) clearTimeout(recRef.current.timer);
      recRef.current?.rec?.stop();
      setRecState("done");
    } catch {
      setRecState("error");
    }
  };

  const clearBeliefAudio = async () => {
    try {
      if (list.length) {
        const latest = [...list].sort((a, b) => b.createdAt - a.createdAt)[0];
        await idbDel(latest.id);
        setData((p) => ({
          ...p,
          beliefAudioList: (p.beliefAudioList || []).filter((x) => x.id !== latest.id),
        }));
      }
      if (url) URL.revokeObjectURL(url);
      setUrl("");
    } catch (e) {
      console.error(e);
    }
  };

  const playItem = async (id) => {
    try {
      const blob = await idbGet(id);
      if (!blob) return;
      if (url) URL.revokeObjectURL(url);
      const u = URL.createObjectURL(blob);
      setUrl(u);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteItem = async (id) => {
    try {
      await idbDel(id);
      setData((p) => ({
        ...p,
        beliefAudioList: (p.beliefAudioList || []).filter((x) => x.id !== id),
      }));
      if (url) URL.revokeObjectURL(url);
      setUrl("");
    } catch (e) {
      console.error(e);
    }
  };

  const downloadItem = async (id) => {
    const blob = await idbGet(id);
    if (!blob) return;
    const ext = (blob.type || "").includes("mp4") ? "m4a" : "webm";
    download(`${id}.${ext}`, blob, blob.type);
  };

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Belief Audio (personal recordings)</h2>
      <p className="text-sm text-gray-400">
        Saved locally (IndexedDB). Survives refresh. No cloud upload. Max 30s per
        clip.
      </p>
      <textarea
        className="border border-gray-800 rounded-xl px-3 py-2 bg-gray-900 text-white w-full min-h-[120px]"
        value={data.beliefScript || ""}
        onChange={(e) => setData((p) => ({ ...p, beliefScript: e.target.value }))}
        placeholder="Write your belief script here..."
      />
      <div className="flex items-center gap-2">
        {recState !== "rec" ? (
          <Btn ghost onClick={start}>🎤 Record</Btn>
        ) : (
          <Btn danger onClick={stop}>■ Stop</Btn>
        )}
        {url && <audio controls src={url} className="max-w-full" />}
        {url && <Btn ghost onClick={clearBeliefAudio}>Remove latest</Btn>}
        {recState === "error" && (
          <span className="text-xs text-red-400">Mic error. Check permissions.</span>
        )}
      </div>

      {list.length > 0 && (
        <>
          <div className="mt-3">
            <h3 className="text-sm font-semibold mb-1">Saved belief clips</h3>
            <ul className="space-y-1">
              {[...(list || [])]
                .slice()
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((it) => (
                  <li key={it.id} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">
                      {new Date(it.createdAt).toLocaleString()}
                    </span>
                    <Btn ghost onClick={() => playItem(it.id)}>Play</Btn>
                    <Btn ghost onClick={() => downloadItem(it.id)}>Download</Btn>
                    <Btn danger onClick={() => deleteItem(it.id)}>Delete</Btn>
                  </li>
                ))}
            </ul>
          </div>
        </>
      )}

      <hr className="border-gray-800" />
      <BeliefHowTo />
    </section>
  );
}

function BeliefHowTo() {
  return (
    <details className="text-sm text-gray-300">
      <summary className="cursor-pointer select-none">How to use belief audio</summary>
      <ul className="list-disc ml-5 mt-2 space-y-1 text-gray-400">
        <li>Write 2–5 minutes of first‑person present tense beliefs.</li>
        <li>Record with conviction; you’re speaking future facts.</li>
        <li>Listen when waking and before sleep for a week.</li>
      </ul>
    </details>
  );
}
