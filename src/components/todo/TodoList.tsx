import { TodoItem } from './TodoItem';
import type { Task } from '@/types';

interface TodoListProps {
  tasks: Task[];
}

/**
 * TodoList
 * Renders a list of task items
 */
export function TodoList({ tasks }: TodoListProps) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TodoItem key={task.id} task={task} />
      ))}
    </div>
  );
}
