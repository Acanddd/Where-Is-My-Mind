import { useState, useRef, useEffect } from 'react';
import { useTodoStore } from '../../store/todoStore';
import styles from './TodoList.module.css';

function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodoStore();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    addTodo(text);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const completed = todos.filter((t) => t.completed).length;

  return (
    <div className={styles.container}>
      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="> NEW TASK..."
          spellCheck={false}
          maxLength={80}
        />
        <button className={styles.addBtn} onClick={handleAdd}>
          ADD
        </button>
      </div>

      <div className={styles.list}>
        {todos.length === 0 && (
          <div className={styles.empty}>[ NO TASKS ]</div>
        )}
        {todos.map((todo) => (
          <div key={todo.id} className={`${styles.item} ${todo.completed ? styles.done : ''}`}>
            <button
              className={styles.checkbox}
              onClick={() => toggleTodo(todo.id)}
              title={todo.completed ? 'Mark incomplete' : 'Mark complete'}
            />
            <span className={styles.text}>{todo.text}</span>
            <button
              className={styles.deleteBtn}
              onClick={() => deleteTodo(todo.id)}
              title="Delete task"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <span>DONE {completed} / {todos.length}</span>
      </div>
    </div>
  );
}

export default TodoList;
