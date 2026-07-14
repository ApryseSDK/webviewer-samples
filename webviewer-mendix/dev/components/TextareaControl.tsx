import React from "react";

interface TextareaControlProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}

const rowStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    marginBottom: 8,
    gap: 4
};

const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: "#d1d5db"
};

const textareaStyle: React.CSSProperties = {
    padding: "6px 8px",
    background: "#374151",
    border: "1px solid #4b5563",
    borderRadius: 4,
    color: "#f9fafb",
    fontSize: 12,
    fontFamily: "monospace",
    resize: "vertical"
};

export const TextareaControl: React.FC<TextareaControlProps> = ({ label, value, onChange, placeholder, rows = 3 }) => {
    return (
        <div style={rowStyle}>
            <label style={labelStyle}>{label}</label>
            <textarea
                style={textareaStyle}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
            />
        </div>
    );
};
