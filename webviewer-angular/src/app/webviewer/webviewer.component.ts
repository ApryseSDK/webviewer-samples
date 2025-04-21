import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import WebViewer from '@pdftron/webviewer';

@Component({
  selector: 'webviewer',
  templateUrl: './webviewer.component.html',
  standalone: true
})
export class WebViewerComponent implements AfterViewInit {
  @ViewChild('viewer') viewer!: ElementRef;

  constructor() { }

  ngAfterViewInit(): void {
    WebViewer({
      path: '../../lib/webviewer',
      licenseKey: 'your_license_key', // sign up to get a free trial key at https://dev.apryse.com
      initialDoc: 'https://apryse.s3.amazonaws.com/public/files/samples/WebviewerDemoDoc.pdf'
    }, this.viewer.nativeElement).then(instance => {
      
      const { documentViewer, Annotations, annotationManager } = instance.Core;

      instance.UI.openElements(['notesPanel']);

      documentViewer.addEventListener('annotationsLoaded', () => {
        console.log('annotations loaded');
      });

      documentViewer.addEventListener('documentLoaded', () => {
        const rectangleAnnot = new Annotations.RectangleAnnotation({
          PageNumber: 1,
          // values are in page coordinates with (0, 0) in the top left
          X: 100,
          Y: 150,
          Width: 200,
          Height: 50,
          Author: annotationManager.getCurrentUser()
        });
        annotationManager.addAnnotation(rectangleAnnot);
        annotationManager.redrawAnnotation(rectangleAnnot);
      });

    })
  }
}