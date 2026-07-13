import React from "react";

interface NumberInputControlProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
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

export const NumberInputControl: React.FC<NumberInputControlProps> = ({ label, value, onChange, min, max, step }) => {
    return (
        <div style={rowStyle}>
            <label style={labelStyle}>{label}</label>
            <input
                style={inputStyle}
                type="number"
                value={value}
                onChange={e => {
                    const n = parseInt(e.target.value, 10);
                    onChange(isNaN(n) ? 0 : n);
                }}
                min={min}
                max={max}
                step={step}
            />
        </div>
    );
};
