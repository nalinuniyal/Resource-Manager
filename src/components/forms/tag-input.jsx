import { useState } from "react";
import { X } from "lucide-react";

export function TagInput({ value = [], onChange, suggestions = [], placeholder = "Type and press Enter" }) {
  const [input, setInput] = useState("");

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 p-2 rounded-xl min-h-[42px]"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(input); }
            if (e.key === "Backspace" && !input && value.length) removeTag(value[value.length - 1]);
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none"
        />
      </div>
      {input && filtered.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filtered.slice(0, 8).map((s) => (
            <button key={s} type="button" onClick={() => addTag(s)}
              className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-blue-300 transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
