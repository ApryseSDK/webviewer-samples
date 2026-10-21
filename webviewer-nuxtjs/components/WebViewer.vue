<template>
  <div id="webviewer" ref="viewer" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
  url: string;
}>();

const viewer = ref<HTMLDivElement | null>(null);

onMounted(async () => {
  if (!viewer.value) {
    return;
  }

  const { public: { demoKey } } = useRuntimeConfig();

  // WebViewer requires browser APIs, so it is imported only after the
  // component is mounted on the client.
  const { default: WebViewer } = await import('@pdftron/webviewer');

  WebViewer.Iframe({
    path: '/lib/webviewer',
    initialDoc: props.url,
    licenseKey: demoKey
  }, viewer.value).then((instance) => {
    // call apis here
  });
});
</script>

<style>
#webviewer {
  height: 100vh;
}
</style>
