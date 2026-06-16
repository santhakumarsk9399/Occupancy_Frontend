import { useState, useRef, useEffect } from "react";
import Icon from "./Icon";
import { icons } from "../utils/constant";

// ─── Dropdown ─────────────────────────────────────────────────────────────────
function Dropdown({ label, value, options, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", minWidth: 190 }}>
      <button
        onClick={() => !disabled && setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          border: "1.5px solid #d1d5db",
          borderRadius: 8,
          background: disabled ? "#f9fafb" : "white",
          cursor: disabled ? "default" : "pointer",
          fontSize: 14,
          color: !value || value === "Select" ? "#9ca3af" : "#111827",
          gap: 8,
        }}
      >
        <span>{value && value !== "Select" ? value : `Select ${label}`}</span>
        <Icon d={icons.chevronDown} size={14} strokeWidth={2} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 200,
            overflow: "hidden",
          }}
        >
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={{
                padding: "9px 14px",
                fontSize: 14,
                cursor: "pointer",
                background: value === opt ? "#eff6ff" : "white",
                color: value === opt ? "#2563eb" : "#374151",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  value === opt ? "#eff6ff" : "#f9fafb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  value === opt ? "#eff6ff" : "white")
              }
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
