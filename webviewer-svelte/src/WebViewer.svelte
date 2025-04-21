<script>

  import { onMount, createEventDispatcher } from 'svelte';
  import WebViewer from '@pdftron/webviewer';

  let instance = null;
  const dispatch = createEventDispatcher();

	onMount(async () => {
		const ele = document.getElementById('viewer');
		WebViewer({
      path: '/lib/webviewer',
			licenseKey: 'YOUR_LICENSE_KEY',
			initialDoc: 'https://apryse.s3.amazonaws.com/public/files/samples/WebviewerDemoDoc.pdf',
		}, ele).then(instance => {
			dispatch('ready', {
				instance
			})
		})
	});

</script>

<style>
	#viewer {
		width: 100%;
		height: 100vh;
	}
</style>

<div id='viewer'>

</div>
