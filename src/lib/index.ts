export type Todo = {
	id: string;
	text: string;
	done: boolean;
};

export type Filters = 'all' | 'todo' | 'done';
