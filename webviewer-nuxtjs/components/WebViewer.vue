<template>
  <div id="webviewer" ref="viewer" />
</template>

<script>
export default {
  name: 'WebViewer',
  props: {
    url: String
  },
  mounted () {
    const WebViewer = globalThis.WebViewer;

    if (!WebViewer) {
      console.error('WebViewer script not loaded');
      return;
    }

    WebViewer.Iframe({
      path: '/lib/webviewer',
      initialDoc: this.url,
      licenseKey: 'your_license_key'
    }, this.$refs.viewer).then((instance) => {
      // call apis here
    });
  }
};
</script>

<style>
#webviewer {
  height: 100vh;
}
</style>
