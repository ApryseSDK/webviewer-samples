/**
 * WidgetState - mirrors the WebViewerContainerProps interface from
 * typings/WebViewerProps.d.ts but with the EditableValue/DynamicValue wrappers
 * unwrapped to plain JS types for the dev test harness.
 *
 * Defaults are sourced from src/WebViewer.xml.
 */

export type DefaultLanguageEnum =
    | "en"
    | "de"
    | "es"
    | "fr"
    | "it"
    | "el"
    | "ja"
    | "ko"
    | "nl"
    | "pt_br"
    | "ru"
    | "zh_cn"
    | "zh_tw"
    | "vi"
    | "uk"
    | "id"
    | "ms"
    | "bn"
    | "hi"
    | "tr";

export interface WidgetState {
    // File
    fileUrl: string;
    enableFilePicker: boolean;
    loadAsPDF: boolean;
    // Editing
    enablePdfEditing: boolean;
    enableOfficeEditing: boolean;
    enableSpreadsheetEditing: boolean;
    // Page Extraction (top-level)
    enablePageExtraction: boolean;
    allowExtractionDownload: boolean;
    // Other
    enableFullAPI: boolean;
    // Annotations - User
    annotationUser: string;
    // Annotations - Options
    enableAnnotations: boolean;
    enableMeasurement: boolean;
    enableRedaction: boolean;
    selectAnnotationOnCreation: boolean;
    // XFDF
    enableXfdfExportButton: boolean;
    enableAutoXfdfExport: boolean;
    enableAutoXfdfImport: boolean;
    // UI
    isVisible: boolean;
    containerHeight: string;
    enableDarkMode: boolean;
    defaultLanguage: DefaultLanguageEnum;
    notesInLeftPanel: boolean;
    enabledElements: string;
    disabledElements: string;
    customCss: string;
    // Accessibility
    accessibleMode: boolean;
    highContrastMode: boolean;
    // Module - Document Updates
    enableDocumentUpdates: boolean;
    enableSaveAsButton: boolean;
    // Module - Real-Time Annotating
    enableRealTimeAnnotating: boolean;
    autoXfdfCommandImportInterval: number;
    allowSavingToMendix: boolean;
    // License
    l: string;
}

export const defaultState: WidgetState = {
    fileUrl: "https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf",
    enableFilePicker: false,
    loadAsPDF: false,
    enablePdfEditing: false,
    enableOfficeEditing: false,
    enableSpreadsheetEditing: false,
    enablePageExtraction: false,
    allowExtractionDownload: false,
    enableFullAPI: false,
    annotationUser: "Guest",
    enableAnnotations: true,
    enableMeasurement: false,
    enableRedaction: false,
    selectAnnotationOnCreation: false,
    enableXfdfExportButton: false,
    enableAutoXfdfExport: false,
    enableAutoXfdfImport: false,
    isVisible: true,
    containerHeight: "100vh",
    enableDarkMode: false,
    defaultLanguage: "en",
    notesInLeftPanel: false,
    enabledElements: "",
    disabledElements: "",
    customCss: "",
    accessibleMode: false,
    highContrastMode: false,
    enableDocumentUpdates: true,
    enableSaveAsButton: true,
    enableRealTimeAnnotating: false,
    autoXfdfCommandImportInterval: 1000,
    allowSavingToMendix: false,
    l: ""
};
