<script>

  import { onMount, createEventDispatcher } from 'svelte';
  import WebViewer from '@pdftron/webviewer';

  let instance = null;
  const dispatch = createEventDispatcher();

	onMount(async () => {
		const ele = document.getElementById('viewer');
	WebViewer({
      path: '/lib'
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
	}
</style>

<div id='viewer' style="height: 100vh;">

</div>
