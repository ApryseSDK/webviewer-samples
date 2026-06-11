import React from "react";

interface TextInputControlProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: "text" | "password";
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

const inputStyle: React.CSSProperties = {
    padding: "6px 8px",
    background: "#374151",
    border: "1px solid #4b5563",
    borderRadius: 4,
    color: "#f9fafb",
    fontSize: 12,
    fontFamily: "monospace"
};

export const TextInputControl: React.FC<TextInputControlProps> = ({ label, value, onChange, placeholder, type = "text" }) => {
    return (
        <div style={rowStyle}>
            <label style={labelStyle}>{label}</label>
            <input
                style={inputStyle}
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
};
