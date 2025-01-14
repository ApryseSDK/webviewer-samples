<script>
	import WebViewer from './WebViewer.svelte';

	const ready = (r) => {
		const instance = r.detail.instance;
		instance.UI.loadDocument("https://pdftron.s3.amazonaws.com/downloads/pl/PDFTRON_about.pdf");
	}
	
</script>

<WebViewer on:ready={ready} />
