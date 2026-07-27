<template>
  <div id="webviewer" ref="viewer"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import WebViewer from "@pdftron/webviewer";

const licenseKey = import.meta.env.VITE_DEMO_KEY;

const props = defineProps<{
  initialDoc: string;
}>();
const viewer = ref<HTMLDivElement | null>(null);

onMounted(() => {
  if (!viewer.value) {
    return;
  }

  WebViewer(
    {
      path: "/lib/webviewer",
      initialDoc: props.initialDoc,
      licenseKey,
    },
    viewer.value,
  ).then((instance) => {
    const { documentViewer, annotationManager, Annotations } = instance.Core;

    documentViewer.addEventListener("documentLoaded", () => {
      const rectangleAnnot = new Annotations.RectangleAnnotation({
        PageNumber: 1,
        // Values are in page coordinates with (0, 0) in the top left.
        X: 100,
        Y: 150,
        Width: 200,
        Height: 50,
        Author: annotationManager.getCurrentUser(),
      });
      annotationManager.addAnnotation(rectangleAnnot);
      annotationManager.redrawAnnotation(rectangleAnnot);
    });
  });
});
</script>

<style>
#webviewer {
  height: 100vh;
}
</style>
