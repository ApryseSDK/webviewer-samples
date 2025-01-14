import React, { useRef, useEffect } from "react";
import WebViewer from "@pdftron/webviewer";
import "./App.css";
import canvasToPDF from "@pdftron/canvas-to-pdf";
import { drawTiger } from "./drawTiger";

const App = () => {
  const viewer = useRef(null);

  useEffect(() => {
    WebViewer(
      {
        path: "/webviewer/lib",
        initialDoc: "/files/PDFTron_about.pdf",
      },
      viewer.current
    ).then(async (instance) => {
      const { documentViewer, annotationManager, Annotations } = instance.Core;

      const annotWidth = 600;
      const annotHeight = 600;

      documentViewer.addEventListener("documentLoaded", async () => {
        const rectangleAnnot = new Annotations.RectangleAnnotation({
          PageNumber: 1,
          // values are in page coordinates with (0, 0) in the top left
          X: 0,
          Y: 0,
          Width: annotWidth,
          Height: annotHeight,
          Author: annotationManager.getCurrentUser(),
        });

        const drawRect = (ctx) => {
          const lineWidth = 20;
          ctx.fillStyle = "red";
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = "black";
          ctx.rect(
            lineWidth / 2,
            lineWidth / 2,
            annotWidth - lineWidth,
            annotHeight - lineWidth
          );
          ctx.fill();
          ctx.stroke();
        };

        const drawGradientCircles = (ctx) => {
          for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
              ctx.strokeStyle = `rgb(
            0,
            ${Math.floor(255 - 42.5 * i)},
            ${Math.floor(255 - 42.5 * j)})`;
              ctx.beginPath();
              ctx.arc(25 + j * 40, 25 + i * 40, 15, 0, Math.PI * 2, true);
              ctx.stroke();
            }
          }
        };

        const drawHatch = (ctx) => {
          let X = 0;
          let Y = 0;

          ctx.save();

          ctx.beginPath();
          ctx.arc(
            annotWidth * 0.5,
            annotHeight * 0.5,
            Math.max(annotHeight * 0.5, 0),
            0,
            Math.PI * 2,
            false
          );
          ctx.closePath();
          ctx.restore();
          ctx.clip();

          ctx.stroke();

          const hatchSize = 10;
          const hatchLineWidth = 1;
          ctx.lineWidth = hatchLineWidth;

          // horizontal lines
          for (let i = Y; i < Y + annotHeight; i += hatchSize) {
            ctx.beginPath();
            ctx.moveTo(X, i);
            ctx.lineTo(X + annotWidth, i);
            ctx.stroke();
          }

          for (let i = X; i < X + annotWidth; i += hatchSize) {
            ctx.beginPath();
            ctx.moveTo(i, Y);
            ctx.lineTo(i, Y + annotHeight);
            ctx.stroke();
          }
        };

        function rnd(min, max) {
          return Math.floor(Math.random() * (max - min + 1) + min);
        }

        const drawTriangles = (ctx) => {
          const canvasWidth = annotWidth;
          const canvasHeight = annotHeight;
          var heightScale = 0.866;

          ctx.fillStyle = "rgb(0,0,0)";
          ctx.fillRect(0, 0, annotWidth, annotHeight);
          ctx.lineWidth = 1;

          var hueStart = rnd(0, 360);
          var triSide = 40;
          var halfSide = triSide / 2;
          var rowHeight = Math.floor(triSide * heightScale);
          var columns = Math.ceil(canvasWidth / triSide) + 1;
          var rows = Math.ceil(canvasHeight / rowHeight);

          var col, row;
          for (row = 0; row < rows; row++) {
            var hue = hueStart + row * 3;

            for (col = 0; col < columns; col++) {
              var x = col * triSide;
              var y = row * rowHeight;
              var clr;

              if (row % 2 !== 0) {
                x -= halfSide;
              }

              // upward pointing triangle
              clr = "hsl(" + hue + ", 50%, " + rnd(0, 60) + "%)";
              ctx.fillStyle = clr;
              ctx.strokeStyle = clr;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + halfSide, y + rowHeight);
              ctx.lineTo(x - halfSide, y + rowHeight);
              ctx.closePath();
              ctx.fill();
              ctx.stroke(); // needed to fill antialiased gaps on edges

              // downward pointing triangle
              clr = "hsl(" + hue + ", 50%, " + rnd(0, 60) + "%)";
              ctx.fillStyle = clr;
              ctx.strokeStyle = clr;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + triSide, y);
              ctx.lineTo(x + halfSide, y + rowHeight);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            }
          }
        };

        const blob = await canvasToPDF(drawGradientCircles, {
          width: rectangleAnnot.Width,
          height: rectangleAnnot.Height,
        });
        const doc = await instance.Core.createDocument(blob, {
          extension: "pdf",
        });

        rectangleAnnot.addCustomAppearance(doc, { pageNumber: 1 });

        annotationManager.addAnnotation(rectangleAnnot);
        // need to draw the annotation otherwise it won't show up until the page is refreshed
        annotationManager.redrawAnnotation(rectangleAnnot);
      });
    });
  }, []);

  return (
    <div className="App">
      <div className="header">React sample</div>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
};

export default App;
