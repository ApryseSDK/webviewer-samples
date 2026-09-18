import React, { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import { createSigningFunctionMap, signingUIConfig } from './signingUIConfig';
import './App.css';

const signers = [
  { id: 'toby-mcdermott', name: 'Toby McDermott', initials: 'TM' },
  { id: 'jennifer-davies', name: 'Jennifer Davies', initials: 'JD' },
];

const emptySignerState = () => ({ signatures: [], initials: [] });

const App = () => {
  const viewer = useRef(null);
  const instanceRef = useRef(null);
  const activeSignerId = useRef(signers[0].id);
  const signaturesBySigner = useRef(new Map(signers.map(signer => [signer.id, emptySignerState()])));
  const isRestoringSignatures = useRef(false);
  const cleanupRef = useRef([]);
  const [activeSigner, setActiveSigner] = useState(signers[0]);

  const getSignatureTool = instance => instance?.Core?.documentViewer?.getTool?.('AnnotationCreateSignature');

  // Only show signatures that belong to the active signer. This keeps the preview
  // and saved-signature list scoped to the current user's signing session.
  const applySignatureFilterForSigner = signerId => {
    const instance = instanceRef.current;
    if (!instance) return;

    instance.UI.setDisplayedSignaturesFilter(annotation => {
      const ownerId = annotation?.getCustomData?.('ownerSignerId') || '';
      return ownerId === signerId;
    });
  };

  const storeSignaturesForSigner = signerId => {
    const instance = instanceRef.current;
    if (!instance) return;

    const signatureTool = getSignatureTool(instance);
    if (!signatureTool) return;

    signaturesBySigner.current.set(signerId, {
      signatures: [...signatureTool.getSavedSignatures()],
      initials: [...signatureTool.getSavedInitials()],
    });
  };

  const loadSignaturesForSigner = signerId => {
    const instance = instanceRef.current;
    if (!instance) return;

    const signatureTool = getSignatureTool(instance);
    if (!signatureTool) return;

    const saved = signaturesBySigner.current.get(signerId) || emptySignerState();
    isRestoringSignatures.current = true;
    signatureTool.deleteAllSavedSignatures();
    signatureTool.deleteAllSavedInitials();

    if (saved.signatures.length) {
      signatureTool.saveSignatures(saved.signatures);
    }
    if (saved.initials.length) {
      signatureTool.saveInitials(saved.initials);
    }

    isRestoringSignatures.current = false;
    applySignatureFilterForSigner(signerId);
  };

  // Field ownership is tracked by signer, so we hide everything else and highlight
  // the next unsigned widget for the active signer.
  const showFieldsForSigner = signerId => {
    const instance = instanceRef.current;
    if (!instance) return Promise.resolve();

    const { annotationManager, Annotations } = instance.Core;
    const SignatureWidgetAnnotation = Annotations.SignatureWidgetAnnotation;
    const formFieldCreationManager = annotationManager.getFormFieldCreationManager();
    const fields = annotationManager.getFieldManager().getFields();
    const visibleWidgets = [];

    fields.forEach(field => {
      const fieldWidgets = field.widgets || [];
      if (!fieldWidgets.length) return;

      fieldWidgets.forEach(widget => {
        if (widget instanceof SignatureWidgetAnnotation) {
          formFieldCreationManager.setShowIndicator(widget, false);
        }
      });

      if (field.getUser() !== signerId) {
        annotationManager.hideAnnotations(fieldWidgets);
        return;
      }

      annotationManager.showAnnotations(fieldWidgets);
      visibleWidgets.push(...fieldWidgets);
    });

    const orderedWidgets = [...visibleWidgets].sort((a, b) => {
      return a.PageNumber - b.PageNumber || a.getY() - b.getY() || a.getX() - b.getX();
    });

    const firstUnsignedWidget = orderedWidgets.find(widget => {
      return widget instanceof SignatureWidgetAnnotation && !widget.isSignedByAppearance();
    });

    if (firstUnsignedWidget) {
      formFieldCreationManager.setIndicatorText(
        firstUnsignedWidget,
        firstUnsignedWidget.requiresInitials() ? 'Initials Here' : 'Sign Here',
      );
      formFieldCreationManager.setShowIndicator(firstUnsignedWidget, true);
    }

    return annotationManager.drawAnnotationsFromList(visibleWidgets);
  };

  useEffect(() => {
    let cancelled = false;

    WebViewer(
      {
        path: 'webviewer',
        fullAPI: true,
        initialDoc: 'contract.pdf',
        disabledElements: ['leftPanel', 'leftPanelButton'],
      },
      viewer.current,
    ).then(instance => {
      if (cancelled || !viewer.current) {
        instance?.UI?.closeDocument?.();
        return;
      }

      instanceRef.current = instance;
      instance.UI.enableFeatures([instance.UI.Feature.Initials]);
      instance.UI.showFormFieldIndicators();

      instance.UI.importModularComponents(signingUIConfig, createSigningFunctionMap(instance));

      const { annotationManager, documentViewer } = instance.Core;
      annotationManager.setCurrentUser(activeSignerId.current);

      const signatureTool = getSignatureTool(instance);
      if (signatureTool) {
        signatureTool.deleteAllSavedSignatures();
        signatureTool.deleteAllSavedInitials();
      }
      applySignatureFilterForSigner(activeSignerId.current);

      const handleSignatureSaved = annotation => {
        if (isRestoringSignatures.current || !annotation || typeof annotation.setCustomData !== 'function') return;

        annotation.setCustomData('ownerSignerId', activeSignerId.current);
        const activeSignatureTool = getSignatureTool(instance);
        if (!activeSignatureTool) return;

        signaturesBySigner.current.set(activeSignerId.current, {
          signatures: [...activeSignatureTool.getSavedSignatures()],
          initials: [...activeSignatureTool.getSavedInitials()],
        });
        applySignatureFilterForSigner(activeSignerId.current);
      };

      const handleSignatureDeleted = () => {
        if (isRestoringSignatures.current) return;

        const activeSignatureTool = getSignatureTool(instance);
        if (!activeSignatureTool) return;

        signaturesBySigner.current.set(activeSignerId.current, {
          signatures: [...activeSignatureTool.getSavedSignatures()],
          initials: [...activeSignatureTool.getSavedInitials()],
        });
      };

      // When a signature appearance is added or removed, re-evaluate the active signer’s
      // visible fields so the indicator advances to the next unsigned spot.
      const handleAnnotationChanged = (annotations, action, options) => {
        const source = options?.source;
        if (action === 'modify' && (source === 'signatureAppearanceAdded' || source === 'signatureAppearanceRemoved')) {
          showFieldsForSigner(activeSignerId.current);
        }
      };

      const handleAnnotationsLoaded = () => {
        showFieldsForSigner(activeSignerId.current);
      };

      const addListener = (target, eventName, handler) => {
        target.addEventListener(eventName, handler);
        cleanupRef.current.push(() => target.removeEventListener?.(eventName, handler));
      };

      addListener(instance.UI, 'signatureSaved', handleSignatureSaved);
      addListener(instance.UI, 'signatureDeleted', handleSignatureDeleted);
      addListener(annotationManager, 'annotationChanged', handleAnnotationChanged);
      addListener(documentViewer, 'annotationsLoaded', handleAnnotationsLoaded);
    });

    return () => {
      cancelled = true;
      cleanupRef.current.forEach(cleanup => cleanup());
      cleanupRef.current = [];

      const instance = instanceRef.current;
      if (instance) {
        instance.UI?.closeDocument?.();
        instance.destroy?.();
        instanceRef.current = null;
      }
    };
  }, []);

  const selectSigner = async signer => {
    if (signer.id === activeSignerId.current || !instanceRef.current) return;

    // Save the previous signer’s signature set before switching to the next signer.
    storeSignaturesForSigner(activeSignerId.current);
    activeSignerId.current = signer.id;
    setActiveSigner(signer);
    instanceRef.current.Core.annotationManager.setCurrentUser(signer.id);
    loadSignaturesForSigner(signer.id);
    await showFieldsForSigner(signer.id);
  };

  return (
    <main className="signing-app">
      <aside className="signer-panel">
        <div className="brand">Apryse Sign</div>
        <div className="panel-copy">
          <p className="eyebrow">Local signing sample</p>
          <h1>Choose a signer</h1>
          <p>Fields are assigned in the document and shown only to the selected signer.</p>
        </div>
        <div className="signer-list" aria-label="Available signers">
          {signers.map(signer => (
            <button
              aria-pressed={signer.id === activeSigner.id}
              className={signer.id === activeSigner.id ? 'signer active' : 'signer'}
              key={signer.id}
              onClick={() => selectSigner(signer)}
              type="button"
            >
              <span className="avatar">{signer.initials}</span>
              <span>{signer.name}</span>
            </button>
          ))}
        </div>
      </aside>
      <section className="viewer-shell">
        <div className="webviewer" ref={viewer} />
      </section>
    </main>
  );
};

export default App;
