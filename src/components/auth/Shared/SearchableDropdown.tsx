"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { SearchableDropdownProps } from "../types";

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  value,
  options,
  placeholderSearch,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm, isOpen]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        onSelect(filteredOptions[highlightedIndex]);
        setIsOpen(false);
        setSearchTerm("");
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div style={{ marginBottom: "12px", position: "relative" }}>
      <label className="auth-label">{label}</label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="form-control auth-input"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsOpen(!isOpen);
            e.preventDefault();
          }
        }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          background: "#fff",
          userSelect: "none",
        }}
      >
        <span style={{ fontWeight: 600, color: value ? "var(--text-main)" : "var(--text-muted)" }}>
          {value || "Vui lòng chọn..."}
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-700" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </span>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 999,
            background: "#fff",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            marginTop: "4px",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "8px", background: "#f8fafc", borderBottom: "1px solid var(--border-color)" }}>
            <input
              type="text"
              autoFocus
              className="form-control auth-input"
              style={{ fontSize: "13px", height: "36px", margin: 0 }}
              placeholder={placeholderSearch}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div ref={listRef} style={{ maxHeight: "200px", overflowY: "auto" }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt === value;
                const isHighlighted = idx === highlightedIndex;
                return (
                  <div
                    key={opt}
                    onClick={() => {
                      onSelect(opt);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    style={{
                      padding: "8px 12px",
                      fontSize: "13px",
                      cursor: "pointer",
                      background: isHighlighted
                        ? "#dbeafe"
                        : isSelected
                        ? "#e8f5e9"
                        : "#fff",
                      fontWeight: isSelected || isHighlighted ? 700 : 400,
                      color: isHighlighted
                        ? "#1e40af"
                        : isSelected
                        ? "var(--primary-color)"
                        : "var(--text-main)",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    {opt}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "12px", fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>
                Không tìm thấy kết quả phù hợp
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
