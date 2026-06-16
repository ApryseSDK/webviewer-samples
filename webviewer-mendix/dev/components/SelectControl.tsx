import React from "react";

interface SelectControlOption<T extends string> {
    value: T;
    label: string;
}

interface SelectControlProps<T extends string> {
    label: string;
    value: T;
    options: SelectControlOption<T>[];
    onChange: (value: T) => void;
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

const selectStyle: React.CSSProperties = {
    padding: "6px 8px",
    background: "#374151",
    border: "1px solid #4b5563",
    borderRadius: 4,
    color: "#f9fafb",
    fontSize: 12
};

export function SelectControl<T extends string>({ label, value, options, onChange }: SelectControlProps<T>) {
    return (
        <div style={rowStyle}>
            <label style={labelStyle}>{label}</label>
            <select style={selectStyle} value={value} onChange={e => onChange(e.target.value as T)}>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
