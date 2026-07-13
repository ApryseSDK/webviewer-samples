import React from "react";

interface ToggleControlProps {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}

const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8
};

const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: "#d1d5db",
    flex: 1,
    cursor: "pointer",
    userSelect: "none"
};

const switchContainerStyle = (checked: boolean): React.CSSProperties => ({
    position: "relative",
    width: 32,
    height: 18,
    background: checked ? "#10b981" : "#4b5563",
    borderRadius: 9,
    cursor: "pointer",
    transition: "background 0.15s ease",
    flexShrink: 0
});

const switchKnobStyle = (checked: boolean): React.CSSProperties => ({
    position: "absolute",
    top: 2,
    left: checked ? 16 : 2,
    width: 14,
    height: 14,
    background: "#f9fafb",
    borderRadius: "50%",
    transition: "left 0.15s ease",
    pointerEvents: "none"
});

export const ToggleControl: React.FC<ToggleControlProps> = ({ label, checked, onChange }) => {
    // Use a div (not label) to avoid the browser's default behavior of
    // clicking a label activating a wrapped input. Manage state via a
    // single onClick handler on the row.
    const handleToggle = () => onChange(!checked);

    return (
        <div style={rowStyle}>
            <span style={labelStyle} onClick={handleToggle}>
                {label}
            </span>
            <span
                style={switchContainerStyle(checked)}
                onClick={handleToggle}
                role="switch"
                aria-checked={checked}
                tabIndex={0}
                onKeyDown={e => {
                    if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        handleToggle();
                    }
                }}
            >
                <span style={switchKnobStyle(checked)} />
            </span>
        </div>
    );
};
