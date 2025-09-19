import React, { useEffect, useState } from "react";

const BASE = "https://playground.4geeks.com/todo";
const USERNAME = "your_username_here"; 

export default function TodoApp() {
  const [tasks, setTasks] = useState([]); 
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const api = (path, opts = {}) =>
    fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });

  const ensureUserAndFetch = async () => {
    setLoading(true);
    try {
      let r = await api(`/users/${USERNAME}`);
      if (r.status === 404) {
        const create = await api(`/users/${USERNAME}`, { method: "POST" });
        if (!create.ok) throw new Error("Failed to create user");
        r = await api(`/users/${USERNAME}`);
      }
      if (!r.ok) throw new Error("Failed to fetch todos");
      const data = await r.json();
      setTasks(Array.isArray(data.todos) ? data.todos : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ensureUserAndFetch();
  }, []);

  const addTask = async () => {
    const label = text.trim();
    if (!label) return;
    try {
      await api(`/todos/${USERNAME}`, {
        method: "POST",
        body: JSON.stringify({ label, is_done: false }),
      });
      setText("");
      await ensureUserAndFetch(); 
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api(`/todos/${id}`, { method: "DELETE" });
      await ensureUserAndFetch();
    } catch (err) {
      console.error(err);
    }
  };

  const clearAll = async () => {
    try {
      await api(`/users/${USERNAME}`, { method: "DELETE" });
      setTasks([]); 
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addTask();
  };

  return (
    <div className="page">
      <h1 className="title">todos</h1>

      <div className="card">
        {/* Input */}
        <div className="input-row">
          <input
            className="new-task"
            placeholder="What needs to be done?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button className="add-btn" onClick={addTask} disabled={loading}>
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>

        {/* List */}
        <ul className="list">
          {loading ? (
            <li className="empty">Loading…</li>
          ) : tasks.length === 0 ? (
            <li className="empty">No tasks, add a task</li>
          ) : (
            tasks.map((t) => (
              <li key={t.id} className="todo-item">
                <span className="text">{t.label}</span>
                <button
                  className="delete"
                  onClick={() => deleteTask(t.id)}
                  title="Delete"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </li>
            ))
          )}
        </ul>

        {/* Footer */}
        <div className="footer footer-row">
          <span>{tasks.length} item left</span>
          <button className="clear-btn" onClick={clearAll} disabled={loading}>
            Clear all tasks
          </button>
        </div>

        <div className="stack stack-1"></div>
        <div className="stack stack-2"></div>
      </div>
    </div>
  );
}
