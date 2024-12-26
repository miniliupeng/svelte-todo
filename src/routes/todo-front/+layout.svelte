<script lang="ts">
	const { children } = $props();
</script>

<div class=" m-10">
	<h1 class=" mb-4 block text-2xl font-bold">今日清单</h1>
	{@render children()}
</div>

<style>
</style>
