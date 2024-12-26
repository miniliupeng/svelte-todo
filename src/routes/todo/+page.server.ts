import { fail } from "@sveltejs/kit";
import { sleep } from "$lib/utils";
import type { Todo } from "$lib";

const todos: Todo[] = [];

export function load() {
  return {
    todos,
  };
}

export const actions = {
  createTodo: async ({ request }) => {
    await sleep(1000);

    const data = await request.formData();
    const text = data.get("text") as string;

    try {
      const newTodo = {
        id: crypto.randomUUID(),
        text,
        done: false,
      };

      todos.push(newTodo);
      return { todos };
    } catch (error: any) {
      return fail(422, { error: error.message });
    }
  },
  deleteTodo: async ({ request }) => {
    await sleep(1000);

    const data = await request.formData();
    const id = data.get("id") as string;

    try {
      // throw new Error("删除事项失败");
      const index = todos.findIndex((todo) => todo.id === id);
      if (index !== -1) todos.splice(index, 1);
    } catch (error: any) {
      return fail(422, { error: error.message });
    }
  },
  toggleTodo: async ({ request }) => {
    await sleep(1000);

    const data = await request.formData();
    const id = data.get("id") as string;

    try {
      // throw new Error("修改事项失败");
      const todo = todos.find((todo) => todo.id === id);
      if (todo) {
        todo.done = !todo.done;
      }
    } catch (error: any) {
      return fail(422, { error: error.message });
    }
  },
  editTodo: async ({ request }) => {
    await sleep(1000);

    const data = await request.formData();
    const id = data.get("id") as string;

    try {
      throw new Error("修改事项失败");
      const todo = todos.find((todo) => todo.id === id);
      if (todo) {
        todo.text = data.get("text") as string;
      }
    } catch (error: any) {
      return fail(422, { error: error.message });
    }
  },
};
