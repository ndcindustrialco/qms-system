"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import type { SignatureType } from "@/types/dar";

// ── Types ─────────────────────────────────────────────────────────────────────

type ProfileData = {
  id: string;
  name: string | null;
  email: string;
  employeeId: string | null;
  position: string | null;
  departmentId: string | null;
  savedSignatureUrl: string | null;
  signatureType: SignatureType | null;
  image: string | null;
  role: string;
};

type Props = {
  profile: ProfileData;
  departmentName: string | null;
};

// ── Signature sub-components (inline, same pattern as SignaturePad) ────────────

const CANVAS_W = 500;
const CANVAS_H = 160;

type SigMode = "DRAW" | "TYPE" | "IMAGE";

const TYPE_FONTS = [
  { labelKey: "dar.approval.sigFontScript", value: "Dancing Script, cursive" },
  { labelKey: "dar.approval.sigFontStyle",  value: "Pacifico, cursive" },
  { labelKey: "dar.approval.sigFontCursive", value: "Great Vibes, cursive" },
] as const;

function DrawPad({ onChange }: { onChange: (url: string | null) => void }) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasContent = useRef(false);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current; if (!canvas) return;
    drawing.current = true;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getPos(e, canvas);
    ctx.beginPath(); ctx.moveTo(x, y);
    e.preventDefault();
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#0f1059";
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y); ctx.stroke();
    hasContent.current = true;
    e.preventDefault();
  }

  function stopDraw() {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current; if (!canvas) return;
    onChange(hasContent.current ? canvas.toDataURL("image/png") : null);
  }

  function clear() {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    hasContent.current = false;
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full border border-slate-200 rounded-lg bg-white cursor-crosshair touch-none"
        style={{ maxHeight: 160 }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <Button variant="ghost" size="sm" type="button" className="self-end text-xs h-7 px-2" onClick={clear}>
        {t("dar.approval.sigClear")}
      </Button>
    </div>
  );
}

function TypePad({ onChange }: { onChange: (url: string | null) => void }) {
  const t = useT();
  const [text, setText] = useState("");
  const [font, setFont] = useState<string>(TYPE_FONTS[0].value);

  const renderToCanvas = useCallback((txt: string, f: string): string | null => {
    if (!txt.trim()) return null;
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_W; canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = "#0f1059";
    ctx.font = `48px ${f}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(txt, CANVAS_W / 2, CANVAS_H / 2);
    return canvas.toDataURL("image/png");
  }, []);

  function handleText(v: string) {
    setText(v);
    onChange(renderToCanvas(v, font));
  }

  function handleFont(f: string) {
    setFont(f);
    onChange(renderToCanvas(text, f));
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        placeholder={t("dar.approval.sigTypePlaceholder")}
        value={text}
        onChange={(e) => handleText(e.target.value)}
        maxLength={40}
      />
      <div className="flex gap-2 flex-wrap">
        {TYPE_FONTS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => handleFont(f.value)}
            className={`h-8 px-3 text-xs rounded-md font-medium transition-colors ${font === f.value ? "bg-emerald-600 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}
          >
            <span style={{ fontFamily: f.value }}>{text || t("dar.approval.sigTypeSample")}</span>
          </button>
        ))}
      </div>
      {text.trim() && (
        <div className="w-full border border-slate-200 rounded-lg bg-white flex items-center justify-center" style={{ height: 100 }}>
          <span style={{ fontFamily: font, fontSize: 40 }} className="text-[#0f1059]">{text}</span>
        </div>
      )}
    </div>
  );
}

function ImagePad({ onChange }: { onChange: (url: string | null) => void }) {
  const t = useT();
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error(t("dar.approval.sigImageSizeError")); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setPreview(url);
      onChange(url);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-200 rounded-lg p-6 cursor-pointer hover:border-primary transition-colors bg-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span className="text-sm text-slate-500">{t("dar.approval.sigImageUploadLabel")}</span>
        <span className="text-xs text-slate-400 mt-1">{t("dar.approval.sigImageUploadHint")}</span>
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
      {preview && (
        <div className="border border-slate-200 rounded-lg bg-white p-3 flex items-center justify-center" style={{ height: 120 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={t("dar.approval.sigAlt")} className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </div>
  );
}

// ── Signature editor section ──────────────────────────────────────────────────

function SignatureEditor({
  currentUrl,
  currentType,
  onSaved,
}: {
  currentUrl: string | null;
  currentType: SignatureType | null;
  onSaved: (url: string | null, type: SignatureType | null) => void;
}) {
  const t = useT();
  const [mode, setMode] = useState<SigMode>("DRAW");
  const [pending, setPending] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const tabs: { key: SigMode; label: string }[] = [
    { key: "DRAW",  label: t("profile.tabDraw") },
    { key: "TYPE",  label: t("profile.tabType") },
    { key: "IMAGE", label: t("profile.tabImage") },
  ];

  async function handleSave() {
    if (!pending) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedSignatureUrl: pending, signatureType: mode }),
      });
      const json = await res.json();
      if (!res.ok || json.error) { toast.error(json.error ?? t("profile.sigSaveFail")); return; }
      toast.success(t("profile.sigSaved"));
      onSaved(pending, mode);
      setEditing(false);
      setPending(null);
    } catch {
      toast.error(t("profile.sigSaveFail"));
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearSignature: true }),
      });
      const json = await res.json();
      if (!res.ok || json.error) { toast.error(json.error ?? t("profile.sigRemoveFail")); return; }
      toast.success(t("profile.sigRemoved"));
      onSaved(null, null);
    } catch {
      toast.error(t("profile.sigRemoveFail"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Current saved signature */}
      {currentUrl && !editing && (
        <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
          <div className="bg-white border border-emerald-200 rounded-lg p-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentUrl} alt={t("dar.approval.sigSavedAlt")} className="h-12 object-contain max-w-40" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-800">{t("profile.sigCurrentLabel")}</p>
            <p className="text-xs text-emerald-600 mt-0.5">{t("profile.sigCurrentType")}: {currentType}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" type="button" onClick={() => setEditing(true)}>
              {t("profile.btnChange")}
            </Button>
            <Button variant="ghost" size="sm" type="button" className="text-rose-500 hover:text-rose-600" onClick={handleClear} disabled={saving}>
              {t("profile.btnRemove")}
            </Button>
          </div>
        </div>
      )}

      {(!currentUrl || editing) && (
        <div className="flex flex-col gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
          {/* Mode tabs */}
          <div className="flex gap-1 p-1 bg-white rounded-lg border border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setMode(tab.key); setPending(null); }}
                className={`flex-1 h-8 text-xs font-medium rounded-md transition-all ${mode === tab.key ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div>
            {mode === "DRAW" && <DrawPad onChange={setPending} />}
            {mode === "TYPE" && <TypePad onChange={setPending} />}
            {mode === "IMAGE" && <ImagePad onChange={setPending} />}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            {editing && (
              <Button variant="ghost" size="sm" type="button" onClick={() => { setEditing(false); setPending(null); }}>
                {t("common.cancel")}
              </Button>
            )}
            <Button size="sm" type="button" disabled={!pending || saving} onClick={handleSave}>
              {saving && <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block mr-1" />}
              {t("profile.btnSaveSig")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main profile client ────────────────────────────────────────────────────────

export default function ProfileClient({ profile, departmentName }: Props) {
  const t = useT();
  const [name, setName] = useState(profile.name ?? "");
  const [position, setPosition] = useState(profile.position ?? "");
  const [saving, setSaving] = useState(false);
  const [savedSigUrl, setSavedSigUrl] = useState(profile.savedSignatureUrl);
  const [savedSigType, setSavedSigType] = useState(profile.signatureType);

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error(t("profile.nameRequired")); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), position: position.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok || json.error) { toast.error(json.error ?? t("profile.saveFail")); return; }
      toast.success(t("profile.saveSuccess"));
    } catch {
      toast.error(t("profile.saveFail"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Avatar + basic info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0 ring-4 ring-slate-100"
          style={{ background: "linear-gradient(135deg, oklch(36% 0.16 264), oklch(28% 0.13 264))", color: "white" }}>
          {(profile.name ?? profile.email).charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-slate-800 truncate">{profile.name ?? "—"}</p>
          <p className="text-sm text-slate-500 truncate">{profile.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {t(`roles.${profile.role}`)}
          </span>
        </div>
      </div>

      {/* Editable info */}
      <form onSubmit={handleSaveInfo} className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col gap-5">
        <h2 className="text-base font-semibold text-slate-800">{t("profile.infoSection")}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              {t("profile.fieldName")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={255}
              required
            />
          </div>

          {/* Employee ID — read only */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">{t("profile.fieldEmpId")}</label>
            <input
              type="text"
              className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-500 cursor-not-allowed"
              value={profile.employeeId ?? "—"}
              readOnly
            />
          </div>

          {/* Department — read only */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">{t("profile.fieldDept")}</label>
            <input
              type="text"
              className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-500 cursor-not-allowed"
              value={departmentName ?? "—"}
              readOnly
            />
          </div>

          {/* Position */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">{t("profile.fieldPosition")}</label>
            <input
              type="text"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder={t("profile.placeholderPosition")}
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              maxLength={255}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button type="submit" size="sm" disabled={saving}>
            {saving && <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block mr-1" />}
            {t("profile.btnSave")}
          </Button>
        </div>
      </form>

      {/* Signature section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">{t("profile.sigSection")}</h2>
          <p className="text-sm text-slate-500 mt-1">{t("profile.sigSectionDesc")}</p>
        </div>

        <SignatureEditor
          currentUrl={savedSigUrl ?? null}
          currentType={savedSigType ?? null}
          onSaved={(url, type) => {
            setSavedSigUrl(url);
            setSavedSigType(type);
          }}
        />
      </div>
    </div>
  );
}
