import React, { useState } from "react";

interface PropertyGroupProps {
    caption: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

const wrapperStyle: React.CSSProperties = {
    borderBottom: "1px solid #374151"
};

const headerStyle: React.CSSProperties = {
    padding: "10px 16px",
    background: "#111827",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    userSelect: "none",
    fontSize: 12,
    fontWeight: 600,
    color: "#d1d5db"
};

const bodyStyle: React.CSSProperties = {
    padding: "8px 16px 12px 16px"
};

const arrowStyle: React.CSSProperties = {
    fontSize: 10,
    color: "#9ca3af"
};

export const PropertyGroup: React.FC<PropertyGroupProps> = ({ caption, defaultOpen = false, children }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={wrapperStyle}>
            <div style={headerStyle} onClick={() => setOpen(o => !o)}>
                <span>{caption}</span>
                <span style={arrowStyle}>{open ? "▼" : "▶"}</span>
            </div>
            {open && <div style={bodyStyle}>{children}</div>}
        </div>
    );
};
