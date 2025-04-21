<script>
	import WebViewer from './WebViewer.svelte';

	const ready = (r) => {
		const instance = r.detail.instance;
	}
	
</script>

<WebViewer on:ready={ready} />
