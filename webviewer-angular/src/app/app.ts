import { Component, signal } from '@angular/core';
import { WebViewerComponent } from './webviewer/webviewer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WebViewerComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected readonly title = signal('Angular-Sample');
}
