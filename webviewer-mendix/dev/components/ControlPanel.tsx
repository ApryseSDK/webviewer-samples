/**
 * ControlPanel - Interactive sidebar for testing all widget properties
 * defined in src/WebViewer.xml. Maps each XML property to a control.
 */
import React from "react";
import { WidgetState, defaultState } from "./widgetState";
import { PropertyGroup } from "./PropertyGroup";
import { ToggleControl } from "./ToggleControl";
import { TextInputControl } from "./TextInputControl";
import { TextareaControl } from "./TextareaControl";
import { SelectControl } from "./SelectControl";
import { NumberInputControl } from "./NumberInputControl";

interface ControlPanelProps {
    state: WidgetState;
    onChange: (value: WidgetState | ((prev: WidgetState) => WidgetState)) => void;
    collapsed: boolean;
    onToggleCollapsed: () => void;
    onRestartViewer: () => void;
}

const LANGUAGE_OPTIONS: Array<{ value: WidgetState["defaultLanguage"]; label: string }> = [
    { value: "en", label: "English" },
    { value: "de", label: "German" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "it", label: "Italian" },
    { value: "el", label: "Greek" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },
    { value: "nl", label: "Dutch" },
    { value: "pt_br", label: "Portuguese" },
    { value: "ru", label: "Russian" },
    { value: "zh_cn", label: "Chinese Simplified" },
    { value: "zh_tw", label: "Chinese Traditional" },
    { value: "vi", label: "Vietnamese" },
    { value: "uk", label: "Ukrainian" },
    { value: "id", label: "Indonesian" },
    { value: "ms", label: "Malaysian" },
    { value: "bn", label: "Bengali" },
    { value: "hi", label: "Hindi" },
    { value: "tr", label: "Turkish" }
];

const panelStyle = (collapsed: boolean): React.CSSProperties => ({
    width: collapsed ? 0 : 320,
    height: "100vh",
    background: "#1f2937",
    color: "#e5e7eb",
    overflow: "hidden",
    transition: "width 0.2s ease",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #374151",
    flexShrink: 0
});

const headerStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderBottom: "1px solid #374151",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#111827"
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 14,
    fontWeight: 600
};

const baseButtonStyle: React.CSSProperties = {
    background: "#374151",
    color: "#e5e7eb",
    border: "1px solid #4b5563",
    borderRadius: 4,
    padding: "4px 8px",
    fontSize: 11,
    cursor: "pointer"
};

const resetButtonStyle: React.CSSProperties = {
    ...baseButtonStyle
};

const restartButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    background: "#1d4ed8",
    border: "1px solid #2563eb"
};

const bodyStyle: React.CSSProperties = {
    overflow: "auto",
    flex: 1
};

const toggleButtonStyle = (collapsed: boolean): React.CSSProperties => ({
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    left: collapsed ? 0 : 320,
    zIndex: 10,
    background: "#1f2937",
    color: "#9ca3af",
    border: "1px solid #374151",
    borderRadius: "0 4px 4px 0",
    // Tall but narrow: a vertical strip that sits along the panel edge
    padding: "16px 0",
    width: 12,
    height: 64,
    cursor: "pointer",
    fontSize: 10,
    lineHeight: 1,
    opacity: 0.6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "left 0.2s ease, opacity 0.15s ease"
});

export const ControlPanel: React.FC<ControlPanelProps> = ({ state, onChange, collapsed, onToggleCollapsed, onRestartViewer }) => {
    const update = <K extends keyof WidgetState>(key: K, value: WidgetState[K]) => {
        onChange(prev => ({ ...prev, [key]: value }));
    };

    const resetAll = () => {
        onChange(() => ({ ...defaultState }));
    };

    return (
        <>
            <button style={toggleButtonStyle(collapsed)} onClick={onToggleCollapsed} title={collapsed ? "Expand panel" : "Collapse panel"}>
                {collapsed ? "▶" : "◀"}
            </button>
            <div style={panelStyle(collapsed)}>
                <div style={headerStyle}>
                    <h2 style={titleStyle}>WebViewer Controls</h2>
                    <div style={{ display: "flex", gap: 6 }}>
                        <button
                            style={restartButtonStyle}
                            onClick={onRestartViewer}
                            title="Unmount and remount the WebViewer instance to apply changes that require a fresh viewer"
                        >
                            Restart
                        </button>
                        <button style={resetButtonStyle} onClick={resetAll} title="Reset all settings to XML defaults">
                            Reset
                        </button>
                    </div>
                </div>
                <div style={bodyStyle}>
                    <PropertyGroup caption="General / File" defaultOpen>
                        <TextInputControl
                            label="URL"
                            value={state.fileUrl}
                            onChange={v => update("fileUrl", v)}
                        />
                        <ToggleControl
                            label="Show file picker"
                            checked={state.enableFilePicker}
                            onChange={v => update("enableFilePicker", v)}
                        />
                        <ToggleControl
                            label="Load as PDF"
                            checked={state.loadAsPDF}
                            onChange={v => update("loadAsPDF", v)}
                        />
                    </PropertyGroup>

                    <PropertyGroup caption="General / Editing">
                        <ToggleControl
                            label="Enable PDF editing"
                            checked={state.enablePdfEditing}
                            onChange={v => update("enablePdfEditing", v)}
                        />
                        <ToggleControl
                            label="Enable Office editing"
                            checked={state.enableOfficeEditing}
                            onChange={v => update("enableOfficeEditing", v)}
                        />
                        <ToggleControl
                            label="Enable Spreadsheet editing"
                            checked={state.enableSpreadsheetEditing}
                            onChange={v => update("enableSpreadsheetEditing", v)}
                        />
                    </PropertyGroup>

                    <PropertyGroup caption="General / Page Extraction">
                        <ToggleControl
                            label="Enable page extraction"
                            checked={state.enablePageExtraction}
                            onChange={v => update("enablePageExtraction", v)}
                        />
                        <ToggleControl
                            label="Allow extraction download"
                            checked={state.allowExtractionDownload}
                            onChange={v => update("allowExtractionDownload", v)}
                        />
                    </PropertyGroup>

                    <PropertyGroup caption="General / Other">
                        <ToggleControl
                            label="Enable full API"
                            checked={state.enableFullAPI}
                            onChange={v => update("enableFullAPI", v)}
                        />
                    </PropertyGroup>

                    <PropertyGroup caption="Annotations / User">
                        <TextInputControl
                            label="User"
                            value={state.annotationUser}
                            onChange={v => update("annotationUser", v)}
                        />
                    </PropertyGroup>

                    <PropertyGroup caption="Annotations / Options">
                        <ToggleControl
                            label="Enable annotations"
                            checked={state.enableAnnotations}
                            onChange={v => update("enableAnnotations", v)}
                        />
                        <ToggleControl
                            label="Enable measurement"
                            checked={state.enableMeasurement}
                            onChange={v => update("enableMeasurement", v)}
                        />
                        <ToggleControl
                            label="Enable redaction"
                            checked={state.enableRedaction}
                            onChange={v => update("enableRedaction", v)}
                        />
                        <ToggleControl
                            label="Select on creation"
                            checked={state.selectAnnotationOnCreation}
                            onChange={v => update("selectAnnotationOnCreation", v)}
                        />
                    </PropertyGroup>

                    <PropertyGroup caption="Annotations / XFDF">
                        <ToggleControl
                            label="Enable XFDF export button"
                            checked={state.enableXfdfExportButton}
                            onChange={v => update("enableXfdfExportButton", v)}
                        />
                        <ToggleControl
                            label="Enable auto XFDF export"
                            checked={state.enableAutoXfdfExport}
                            onChange={v => update("enableAutoXfdfExport", v)}
                        />
                        <ToggleControl
                            label="Enable auto XFDF import"
                            checked={state.enableAutoXfdfImport}
                            onChange={v => update("enableAutoXfdfImport", v)}
                        />
                    </PropertyGroup>

                    <PropertyGroup caption="UI">
                        <ToggleControl
                            label="Is visible"
                            checked={state.isVisible}
                            onChange={v => update("isVisible", v)}
                        />
                        <TextInputControl
                            label="Container height"
                            value={state.containerHeight}
                            onChange={v => update("containerHeight", v)}
                        />
                        <ToggleControl
                            label="Enable dark mode"
                            checked={state.enableDarkMode}
                            onChange={v => update("enableDarkMode", v)}
                        />
                        <SelectControl
                            label="Default language"
                            value={state.defaultLanguage}
                            options={LANGUAGE_OPTIONS}
                            onChange={v => update("defaultLanguage", v)}
                        />
                        <ToggleControl
                            label="Notes in left panel"
                            checked={state.notesInLeftPanel}
                            onChange={v => update("notesInLeftPanel", v)}
                        />
                        <TextareaControl
                            label="Enabled elements (one per line)"
                            value={state.enabledElements}
                            onChange={v => update("enabledElements", v)}
                        />
                        <TextareaControl
                            label="Disabled elements (one per line)"
                            value={state.disabledElements}
                            onChange={v => update("disabledElements", v)}
                        />
                        <TextInputControl
                            label="Custom CSS path"
                            value={state.customCss}
                            onChange={v => update("customCss", v)}
                            placeholder="/my-styles.css"
                        />
                    </PropertyGroup>

                    <PropertyGroup caption="Accessibility">
                        <ToggleControl
                            label="Enable accessibility mode"
                            checked={state.accessibleMode}
                            onChange={v => update("accessibleMode", v)}
                        />
                        <ToggleControl
                            label="Enable high contrast mode"
                            checked={state.highContrastMode}
                            onChange={v => update("highContrastMode", v)}
                        />
                    </PropertyGroup>

                    <PropertyGroup caption="Module / Document Updates">
                        <ToggleControl
                            label="Enable document updates"
                            checked={state.enableDocumentUpdates}
                            onChange={v => update("enableDocumentUpdates", v)}
                        />
                        <ToggleControl
                            label="Enable save as"
                            checked={state.enableSaveAsButton}
                            onChange={v => update("enableSaveAsButton", v)}
                        />
                    </PropertyGroup>

                    <PropertyGroup caption="Module / Real-Time Annotating">
                        <ToggleControl
                            label="Enable real-time annotating"
                            checked={state.enableRealTimeAnnotating}
                            onChange={v => update("enableRealTimeAnnotating", v)}
                        />
                        <NumberInputControl
                            label="Auto import interval (ms)"
                            value={state.autoXfdfCommandImportInterval}
                            onChange={v => update("autoXfdfCommandImportInterval", v)}
                            min={100}
                            step={100}
                        />
                    </PropertyGroup>

                    <PropertyGroup caption="Module / Page Extraction">
                        <ToggleControl
                            label="Allow saving to Mendix"
                            checked={state.allowSavingToMendix}
                            onChange={v => update("allowSavingToMendix", v)}
                        />
                    </PropertyGroup>

                    <PropertyGroup caption="License">
                        <TextInputControl
                            label="License key"
                            value={state.l}
                            onChange={v => update("l", v)}
                            placeholder="Paste your Apryse license key"
                            type="password"
                        />
                    </PropertyGroup>
                </div>
            </div>
        </>
    );
};

// Re-export so the main file can default-import state shape
export { defaultState } from "./widgetState";
export type { WidgetState } from "./widgetState";
