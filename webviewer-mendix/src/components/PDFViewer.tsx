import React, { createElement, useRef, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import viewer, { WebViewerInstance } from "@pdftron/webviewer";
import WebViewerModuleClient from "../clients/WebViewerModuleClient";
import PageExtractionModal from "./PageExtractionModal";

export interface InputProps {
    containerHeight: string;
    fileUrl?: string;
    file?: any;
    enableFilePicker?: boolean;
    annotationUser?: string;
    accessibleMode?: boolean;
    enableMeasurement?: boolean;
    enableRedaction?: boolean;
    enableAnnotations?: boolean;
    xfdfAttribute?: any;
    enableXfdfExportButton: boolean;
    enableAutoXfdfExport: boolean;
    enableAutoXfdfImport: boolean;
    loadAsPDF?: boolean;
    highContrastMode?: boolean;
    notesInLeftPanel?: boolean;
    enabledElements: string;
    disabledElements: string;
    selectAnnotationOnCreation?: boolean;
    isVisible?: boolean;
    enableDarkMode?: boolean;
    enableFullAPI?: boolean;
    customCss?: string;
    defaultLanguage: string;
    enablePdfEditing?: boolean;
    enableOfficeEditing?: boolean;
    enablePageExtraction?: boolean;
    allowExtractionDownload?: boolean;
    allowSavingToMendix?: boolean;
    l?: string;
    mx: any;
    enableDocumentUpdates?: boolean;
    enableSaveAsButton?: boolean;
    enableRealTimeAnnotating?: boolean;
    autoXfdfCommandImportInterval?: number;
}

const hasAttribute = (attribute: any): boolean => attribute && attribute.status === "available";
const DEFAULT_ANNOT_COMMAND =
    '<?xml version="1.0" encoding="UTF-8" ?>\n<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">\n<fields />\n<add />\n<modify />\n<delete />\n</xfdf>';

const PDFViewer: React.FC<InputProps> = props => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const moduleClientRef: React.MutableRefObject<WebViewerModuleClient> = useRef(new WebViewerModuleClient(props.mx));
    const isDocumentLoadedRef: React.MutableRefObject<boolean> = useRef(false);
    const previousFileIdRef: React.MutableRefObject<any> = useRef(null);
    const currentFileIdRef: React.MutableRefObject<any> = useRef(null);
    const wvUIEventHandlers: React.MutableRefObject<any> = useRef({});
    const realtimeImportHandleRef: React.MutableRefObject<any> = useRef(null);
    const exportedXfdfCommandsRef: React.MutableRefObject<string[]> = useRef([]);
    const lastQueryDateRef: React.MutableRefObject<string> = useRef(new Date("1950-01-01").toISOString());

    const [wvInstance, setInstance] = useState<null | WebViewerInstance>(null);

    const moduleClient = moduleClientRef.current;

    const swapFileIds = (nextFileId: string | null | undefined = null): void => {
        previousFileIdRef.current = currentFileIdRef.current;
        currentFileIdRef.current = nextFileId;
    };

    // Perform clean-up of WV when unmounted
    useEffect(() => {
        return () => {
            if (wvInstance) {
                clearInterval(realtimeImportHandleRef.current);
                // Disposing WV events
                wvInstance.UI.dispose();
            }
        };
    }, [wvInstance]);

    // https://stackoverflow.com/questions/53845595/wrong-react-hooks-behaviour-with-event-listener
    useEffect(() => {
        if (wvInstance && wvUIEventHandlers.current) {
            const { Core, UI } = wvInstance;

            const exportAnnotations = async (): Promise<string> => {
                if (!wvInstance) {
                    return "<xfdf />";
                }
                const { Core } = wvInstance;
                const { Annotations, annotationManager } = Core;
                const annotList = annotationManager
                    .getAnnotationsList()
                    .filter(annot => !(annot instanceof Annotations.Link && annot.isAutomaticLink()));
                const xfdfString = await Core.annotationManager.exportAnnotations({
                    annotList,
                    fields: true,
                    links: true,
                    widgets: true
                });

                return xfdfString;
            };

            const exportAnnotationCommand = async (): Promise<string> => {
                if (!wvInstance) {
                    return "<xfdf />";
                }
                const { Core } = wvInstance;
                const xfdfString = await Core.annotationManager.exportAnnotationCommand();

                return xfdfString;
            };

            wvUIEventHandlers.current.saveCurrentDocument = async () => {
                const { Core, UI } = wvInstance;
                // Send it merged with the document data to REST API to update
                if (currentFileIdRef.current) {
                    // Show existing loading modal
                    UI.openElements(["loadingModal"]);

                    // Add minimum artificial delay to make it look like work is being done
                    // Otherwise, requests may complete too fast
                    const uiDelay = new Promise(resolve => {
                        setTimeout(() => {
                            resolve(undefined);
                        }, 3000);
                    });

                    // Export annotation XFDF
                    const xfdfString = await exportAnnotations();

                    const fileData = await Core.documentViewer.getDocument().getFileData({ xfdfString });

                    if (fileData) {
                        await moduleClient.updateFile(currentFileIdRef.current || "", fileData);

                        // Complete when one of them finish
                        await Promise.all([uiDelay]);
                    } else {
                        console.warn(
                            "Could not save document since there was no file data. This could have been due to an error or missing license key. Please refer to the console for details."
                        );
                    }

                    UI.closeElements(["loadingModal"]);
                }
            };
            wvUIEventHandlers.current.saveAsDocument = async () => {
                // Export annotation XFDF
                const xfdfString = await exportAnnotations();

                const fileData = await Core.documentViewer.getDocument().getFileData({ xfdfString });

                const saveTask: any = moduleClient.saveFile(fileData);

                // Add minimum artificial delay to make it look like work is being done
                // Otherwise, requests may complete too fast
                const uiDelay = new Promise(resolve => {
                    setTimeout(() => {
                        resolve(undefined);
                    }, 3000);
                });

                // Show existing loading modal
                UI.openElements(["loadingModal"]);

                // Complete when one of them finish
                await Promise.all([uiDelay, saveTask]);

                const currentId = await saveTask;
                swapFileIds(currentId);

                UI.closeElements(["loadingModal"]);
            };
            wvUIEventHandlers.current.updateXfdfAttribute = async (
                _annotations: any[],
                _action: string,
                _info: any
            ): Promise<void> => {
                if (!currentFileIdRef.current) {
                    return;
                }
                const xfdfString = await exportAnnotations();
                // Update Mendix XFDF Attribute
                props.xfdfAttribute.setValue(xfdfString);
            };
            wvUIEventHandlers.current.realtimeExportXfdfCommand = async (
                _annotations: any[],
                _action: string,
                _info: any
            ): Promise<void> => {
                if (!currentFileIdRef.current) {
                    return;
                }
                const annotCommandXfdf = await exportAnnotationCommand();
                if (annotCommandXfdf === DEFAULT_ANNOT_COMMAND) {
                    return;
                }
                exportedXfdfCommandsRef.current.push(annotCommandXfdf);
                await moduleClientRef.current.createXfdfCommand(currentFileIdRef.current, annotCommandXfdf);
            };
            wvUIEventHandlers.current.realtimeImportXfdfCommand = async (): Promise<void> => {
                if (!wvInstance || !currentFileIdRef.current) {
                    return;
                }
                const doc = wvInstance.Core.documentViewer.getDocument();
                if (!doc) {
                    return;
                }
                await doc.getDocumentCompletePromise();
                const commands = await moduleClient.getLatestXfdfCommands(
                    currentFileIdRef.current,
                    lastQueryDateRef.current
                );
                commands.forEach(async command => {
                    // Do not import what was recently exported
                    const index = exportedXfdfCommandsRef.current.findIndex(
                        prevXfdfCommand => prevXfdfCommand === command.XFDF
                    );
                    if (index >= 0) {
                        exportedXfdfCommandsRef.current.splice(index, 1);
                        return;
                    }
                    const updated = await wvInstance.Core.annotationManager.importAnnotationCommand(command.XFDF);
                    wvInstance.Core.annotationManager.drawAnnotationsFromList(updated);
                });
                lastQueryDateRef.current = new Date().toISOString();
            };
            if (props.enableRealTimeAnnotating) {
                if (wvUIEventHandlers.current.debouncedXfdfCommandUpdate) {
                    Core.annotationManager.removeEventListener(
                        "annotationChanged",
                        wvUIEventHandlers.current.debouncedXfdfCommandUpdate
                    );
                }
                wvUIEventHandlers.current.debouncedXfdfCommandUpdate = debounce(
                    wvUIEventHandlers.current.realtimeExportXfdfCommand,
                    props.autoXfdfCommandImportInterval || 1000
                );
                Core.annotationManager.addEventListener(
                    "annotationChanged",
                    wvUIEventHandlers.current.debouncedXfdfCommandUpdate
                );
            }
            if (props.enableAutoXfdfExport) {
                if (wvUIEventHandlers.current.debouncedXfdfUpdate) {
                    Core.annotationManager.removeEventListener(
                        "annotationChanged",
                        wvUIEventHandlers.current.debouncedXfdfUpdate
                    );
                }
                wvUIEventHandlers.current.debouncedXfdfUpdate = debounce(
                    wvUIEventHandlers.current.updateXfdfAttribute,
                    1000
                );
                Core.annotationManager.addEventListener(
                    "annotationChanged",
                    wvUIEventHandlers.current.debouncedXfdfUpdate
                );
            }
        }
    }, [
        wvInstance,
        moduleClient,
        props.enableAutoXfdfExport,
        props.xfdfAttribute,
        props.enableRealTimeAnnotating,
        props.autoXfdfCommandImportInterval
    ]);

    // Mount WV only once
    useEffect(() => {
        viewer(
            {
                path: "/resources/lib",
                enableFilePicker: props.enableFilePicker,
                annotationUser: props.annotationUser,
                accessibleMode: props.accessibleMode,
                enableMeasurement: props.enableMeasurement,
                enableRedaction: props.enableRedaction,
                enableAnnotations: props.enableAnnotations,
                loadAsPDF: props.loadAsPDF,
                highContrastMode: props.highContrastMode,
                notesInLeftPanel: props.notesInLeftPanel,
                disabledElements: props.disabledElements.split("\r\n"),
                selectAnnotationOnCreation: props.selectAnnotationOnCreation,
                fullAPI: props.enableFullAPI,
                css: props.customCss,
                licenseKey: props.l
            },
            viewerRef.current as HTMLDivElement
        ).then((instance: WebViewerInstance) => {
            const { Core, UI } = instance;

            setInstance(instance);

            UI.setLanguage(props.defaultLanguage);

            if (props.enableDarkMode) {
                UI.setTheme("dark");
            } else {
                UI.setTheme("light");
            }

            if (props.enabledElements) {
                UI.enableElements(props.enabledElements.split("\r\n"));
            }

            // Toggling features
            if (props.enablePdfEditing) {
                UI.enableFeatures([UI.Feature.ContentEdit]);
            } else {
                UI.disableFeatures([UI.Feature.ContentEdit]);
            }

            // Check whether the backend module is available
            moduleClient.checkForModule().then(hasWebViewerModule => {
                if (!hasWebViewerModule) {
                    return;
                }

                if (props.enablePageExtraction) {
                    const dataElement = "pageExtractionElement";
                    UI.addCustomModal({
                        dataElement,
                        render: (): any => {
                            return (
                                <PageExtractionModal
                                    wvInstance={instance}
                                    dataElement={dataElement}
                                    moduleClient={moduleClientRef.current}
                                    allowDownload={!!props.allowExtractionDownload}
                                    allowSaveAs={!!props.allowSavingToMendix}
                                />
                            );
                        },
                        header: undefined,
                        body: undefined,
                        footer: undefined
                    });

                    UI.setHeaderItems((header: any) => {
                        header.push({
                            type: "actionButton",
                            title: "Page Extraction",
                            img: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path class="cls-1" d="M16.49,13.54h1.83V9.25s0,0,0-.06a.59.59,0,0,0,0-.23.32.32,0,0,0,0-.09.8.8,0,0,0-.18-.27l-5.5-5.5a.93.93,0,0,0-.26-.18l-.09,0a1,1,0,0,0-.24,0l-.05,0H5.49A1.84,1.84,0,0,0,3.66,4.67V19.33a1.84,1.84,0,0,0,1.83,1.84H11V19.33H5.49V4.67H11V9.25a.92.92,0,0,0,.92.92h4.58Z"/><path class="cls-1" d="M20.21,17.53,17.05,15a.37.37,0,0,0-.6.29v1.6H12.78v1.84h3.67v1.61a.37.37,0,0,0,.6.29l3.16-2.53A.37.37,0,0,0,20.21,17.53Z"/></svg>`,
                            onClick: () => {
                                UI.openElements([dataElement]);
                            }
                        });
                    });
                }

                UI.setHeaderItems((header: any) => {
                    if (props.enableDocumentUpdates) {
                        header.push({
                            type: "actionButton",
                            title: "Save document",
                            img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
                            onClick: async () => wvUIEventHandlers.current.saveCurrentDocument()
                        });
                    }

                    if (props.enableSaveAsButton) {
                        header.push({
                            type: "actionButton",
                            title: "Save As",
                            img: `<svg width="auto" height="auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.3439 12.2929C20.9534 11.9024 20.3202 11.9024 19.9297 12.2929L18.9611 13.2615L20.6786 14.979L21.6472 14.0104C22.0377 13.6199 22.0377 12.9867 21.6472 12.5962L21.3439 12.2929Z" fill="black"/>
                            <path d="M19.5615 16.0961L17.844 14.3786L12.2584 19.9642L12 21.9401L13.9759 21.6817L19.5615 16.0961Z" fill="black"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.05087 21H4C2.897 21 2 20.103 2 19V5C2 3.897 2.897 3 4 3H15C15.266 3 15.52 3.105 15.707 3.293L19.707 7.293C19.895 7.48 20 7.735 20 8V10.0509L18.0003 12.0505L18 8.414L14.586 5H14V9H13H12H10H8H6V5H4V19H6V14C6 12.897 6.897 12 8 12H14C15.103 12 16 12.897 16 14V14.0509L14 16.0509V14H8V19H11.0509L9.05087 21ZM10 7H12V5H10V7Z" fill="black"/>
                            </svg>`,
                            onClick: async () => wvUIEventHandlers.current.saveAsDocument()
                        });
                    }
                });

                // Manual and auto XFDF export
                if (hasAttribute(props.xfdfAttribute)) {
                    if (props.xfdfAttribute.readOnly) {
                        console.warn(
                            "The XFDF attribute is read-only. Please check the user permissions or allow the data source to be editable."
                        );
                        return;
                    }

                    if (props.enableXfdfExportButton) {
                        UI.setHeaderItems((header: any) => {
                            header.push({
                                type: "actionButton",
                                title: "Save XFDF",
                                img: `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><path d="M0,0h24v24H0V0z" fill="none"/></g><g><g><path d="M19,3h-4.18C14.4,1.84,13.3,1,12,1S9.6,1.84,9.18,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5 C21,3.9,20.1,3,19,3z M12,2.75c0.41,0,0.75,0.34,0.75,0.75S12.41,4.25,12,4.25s-0.75-0.34-0.75-0.75S11.59,2.75,12,2.75z M19,19H5 V5h14V19z"/><polygon points="15.08,11.03 12.96,8.91 7,14.86 7,17 9.1,17"/><path d="M16.85,9.27c0.2-0.2,0.2-0.51,0-0.71l-1.41-1.41c-0.2-0.2-0.51-0.2-0.71,0l-1.06,1.06l2.12,2.12L16.85,9.27z"/></g></g></svg>`,
                                onClick: () => wvUIEventHandlers.current.updateXfdfAttribute()
                            });
                        });
                    }
                }

                // Continue auto XFDF import after initial
                if (props.enableRealTimeAnnotating && currentFileIdRef.current) {
                    if (realtimeImportHandleRef.current) {
                        clearInterval(realtimeImportHandleRef.current);
                    }
                    realtimeImportHandleRef.current = setInterval(() => {
                        wvUIEventHandlers.current.realtimeImportXfdfCommand();
                    }, props.autoXfdfCommandImportInterval || 1000);
                }
            });

            Core.documentViewer.addEventListener("documentLoaded", () => {
                isDocumentLoadedRef.current = true;
            });

            Core.documentViewer.addEventListener("documentUnloaded", () => {
                isDocumentLoadedRef.current = false;
                swapFileIds();
            });

            Core.documentViewer.setDocumentXFDFRetriever(async () => {
                // Only auto import when we are loading from a file entity
                if (currentFileIdRef.current && props.enableAutoXfdfImport && hasAttribute(props.xfdfAttribute)) {
                    return props.xfdfAttribute.value;
                }
            });
        });
    }, [viewer]);

    // Attributes in Mendix may update later, this will load the file after the update
    useEffect(() => {
        // Load from attribute over plain string
        if (wvInstance) {
            if (hasAttribute(props.file)) {
                const url = new URLSearchParams(props.file.value.uri.split("?")[1]);
                swapFileIds(url.get("guid"));
                wvInstance.UI.loadDocument(props.file.value.uri, {
                    filename: props.file.value.name,
                    enableOfficeEditing: props.enableOfficeEditing
                });
            } else if (props.fileUrl) {
                swapFileIds();
                wvInstance.UI.loadDocument(props.fileUrl, { enableOfficeEditing: props.enableOfficeEditing });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wvInstance, props.fileUrl]); // Ignore file URL attribute or it will cause the file to reload

    useEffect(() => {
        // Setting the annotation user in WV
        if (wvInstance && props.annotationUser) {
            wvInstance.Core.annotationManager.setCurrentUser(props.annotationUser);
        }
    }, [wvInstance, props.annotationUser]);

    return (
        <div
            className="webviewer"
            style={{
                height: props.containerHeight,
                visibility:
                    props.isVisible || props.isVisible === undefined || props.isVisible === null ? "visible" : "hidden"
            }}
            ref={viewerRef}
        ></div>
    );
};

export default PDFViewer;
