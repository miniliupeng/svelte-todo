<script lang="ts">
	import type { Todo, Filters } from '$lib';
	import { fly, slide } from 'svelte/transition';
	import { enhance, applyAction, deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import DeleteBtn from './remove.svg';

	let { data, form } = $props();

	const { todos: todoList = [] } = data;

	let loading = $state(false);
	let deleting: string[] = $state([]);

	let todos = $state<Todo[]>(todoList);
	let filter = $state<Filters>('all');

	let filteredTodos = $derived(filterTodos());

	function filterTodos() {
		switch (filter) {
			case 'all':
				return todos;
			case 'todo':
				return todos.filter((t) => !t.done);
			case 'done':
				return todos.filter((t) => t.done);
			default:
				return todos;
		}
	}

	$effect(() => {
		todos = data.todos;
	});

	const onToggleTodo = (todo: any) => async (event: Event) => {
		event.preventDefault();
		const checkboxEl = event.target as HTMLInputElement;

		const formData = new FormData();
		formData.append('id', todo.id);
		formData.append('done', checkboxEl.checked.toString());
		const response = await fetch('?/toggleTodo', {
			method: 'POST',
			body: formData
		});

		const result: ActionResult = deserialize(await response.text());

		if (result.type === 'success' || result.type === 'failure') {
			await invalidateAll();
		}

		applyAction(result);
	};

	const onEditTodo = (todo: any) => async (event: Event) => {
		event.preventDefault();
		const inputEl = event.target as HTMLInputElement;
		const formData = new FormData();
		formData.append('id', todo.id);
		formData.append('text', inputEl.value);
		const response = await fetch('?/editTodo', {
			method: 'POST',
			body: formData
		});

		const result: ActionResult = deserialize(await response.text());

		if (result.type === 'success' || result.type === 'failure') {
			await invalidateAll();
		}

		applyAction(result);
	};

	function remaining(todos: Todo[]) {
		return todos.filter((t) => !t.done).length;
	}

	function setFilter(newFilter: Filters) {
		filter = newFilter;
	}
</script>

<form
	action="?/createTodo"
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			update();
		};
	}}
>
	<input
		placeholder="添加待办事项"
		class="mb-4 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
		name="text"
		disabled={loading}
	/>
	<button type="submit" class="hidden">提交</button>
</form>

{#if form?.error}
	<p in:fly={{ y: 20 }} class="mb-4 rounded-md bg-red-400 px-4 py-2 text-white">
		{form.error}
	</p>
{/if}

<div class="mb-4 flex items-center gap-4">
	{#each [['all', '全部'], ['todo', '待办'], ['done', '已完成']] as [filterType, filterName]}
		<button
			class={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white ${filter === filterType ? 'bg-indigo-500' : 'bg-gray-200'}`}
			onclick={() => {
				setFilter(filterType as Filters);
			}}>{filterName}</button
		>
	{/each}
</div>

<ul class="mb-4 flex flex-col gap-4">
	{#each filteredTodos.filter((todo) => !deleting.includes(todo.id)) as todo (todo.id)}
		<li class:opacity-40={todo.done} class="flex items-center gap-4"  transition:fly={{ y: -20 }}>
			<input type="checkbox" bind:checked={todo.done} onchange={onToggleTodo(todo)} />

			<input
				type="text"
				class="block flex-1 rounded-md border-0 p-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
				bind:value={todo.text}
				onchange={onEditTodo(todo)}
			/>

			<form
				action="?/deleteTodo"
				method="POST"
				use:enhance={() => {
					deleting = [...deleting, todo.id];
					return async ({ update }) => {
						await update();
						deleting = deleting.filter((id) => id !== todo.id);
					};
				}}
			>
				<input type="hidden" name="id" value={todo.id} />
				<button aria-label="Remove" type="submit">
					<img src={DeleteBtn} class="w-4" alt="删除按钮" />
				</button>
			</form>
		</li>
	{/each}
	{#if loading}
		<span class="loading">Loading...</span>
	{/if}
</ul>

<p>剩余待办事项：{remaining(todos)}</p>


<p>乐观更新：编辑清单文本会失败</p>

