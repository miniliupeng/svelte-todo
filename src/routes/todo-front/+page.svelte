<script lang="ts">
	import { fly } from 'svelte/transition';
	import DeleteBtn from './remove.svg';
	type Todo = {
		id: string;
		text: string;
		done: boolean;
	};

	type Filters = 'all' | 'todo' | 'done';
	const filters: [Filters, string][] = [
		['all', '全部'],
		['todo', '代办'],
		['done', '已完成']
	];
	const todos = $state<Todo[]>([
		{ id: 'gewrii', text: '阅读', done: false },
		{ id: '4m9ha4', text: '写作', done: false },
		{ id: 'b9u33z', text: '冥想', done: false }
	]);

	let filter = $state<Filters>('all');
	function setFilter(newFilter: Filters) {
		filter = newFilter;
	}

	const filteredTodos = $derived.by(() => {
		if (filter === 'all') return todos;
		return todos.filter((todo) => todo.done === (filter === 'done'));
	});

	function onAddTodo(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		const todoElement = event.target as HTMLInputElement;
		const text = todoElement.value;
		if (text) {
			todos.push({ id: Math.random().toString(36).substring(-6), text, done: false });
			todoElement.value = '';
		}
	}

	function onRemoveTodo(event: Event) {
		const buttonEl = event.target as HTMLButtonElement; // 触发事件的实际元素  event.currentTarget 才是绑定事件的元素
		const id = buttonEl.dataset.id;
		if (id) {
			const index = todos.findIndex((t) => t.id === id);
			todos.splice(index, 1);
		}
	}

	function remaining(todos: Todo[]) {
		console.log('recalculating');
		return todos.filter((t) => !t.done).length;
	}
  const total = $derived(todos.filter((t) => !t.done).length)
  $inspect(total);
	// $inspect(filteredTodos);
</script>

<input
	placeholder="添加待办事项"
	class="mb-4 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
	onkeydown={onAddTodo}
/>

<div class="mb-4 flex items-center gap-4">
	{#each filters as [filterType, filterName]}
		<button
			class={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white ${filter === filterType ? 'bg-indigo-500' : 'bg-gray-200'}`}
			onclick={() => setFilter(filterType)}
		>
			{filterName}
		</button>
	{/each}
</div>

<ul class=" mb-4 flex flex-col gap-4">
	{#each filteredTodos as todo (todo.id)}
		<li class="flex items-center gap-4" class:opacity-40={todo.done} transition:fly={{ y: -20 }}>
			<input type="checkbox" bind:checked={todo.done} />
			<input
				type="text"
				class="block flex-1 rounded-md border-0 p-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
				bind:value={todo.text}
			/>
			<button onclick={onRemoveTodo} aria-label="Remove">
				<img src={DeleteBtn} class="w-4" alt="删除按钮" data-id={todo.id} />
			</button>
		</li>
	{/each}
</ul>

<p>剩余待办事项：{remaining(todos)}</p>