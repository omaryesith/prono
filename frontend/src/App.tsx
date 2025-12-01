import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Server,
  Wifi,
  WifiOff,
  Plus,
  CheckCircle,
  List,
  Box,
} from "lucide-react";
import { config } from "./config";

// --- CONFIGURATION ---
const API_URL = config.apiUrl;
const WS_URL = config.wsUrl;

// --- TYPES ---
interface Message {
  type: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface AuthToken {
  access: string;
  refresh: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  owner_id: number;
}

interface Task {
  id: number;
  title: string;
  is_completed: boolean;
  assigned_to_id: number | null;
}

// --- CUSTOM HOOK: WEBSOCKET ---
const usePronoSocket = (projectId: number | null, token: string | null) => {
  const [status, setStatus] = useState<
    "DISCONNECTED" | "CONNECTING" | "CONNECTED"
  >("DISCONNECTED");
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!projectId || !token) return;

    // Reset messages when changing projects
    setMessages([]);

    const ws = new WebSocket(`${WS_URL}/${projectId}/?token=${token}`);
    socketRef.current = ws;
    setStatus("CONNECTING");

    ws.onopen = () => {
      setStatus("CONNECTED");
      console.log("🔌 WS Connected");
    };

    ws.onclose = () => {
      setStatus("DISCONNECTED");
      console.log("🔌 WS Disconnected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (
        data.type === "chat_message" ||
        data.type === "connection_established"
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };

    return () => {
      ws.close();
    };
  }, [projectId, token]);

  const sendMessage = useCallback((text: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "chat_message",
          text: text,
        }),
      );
    }
  }, []);

  return { status, messages, sendMessage };
};

// --- COMPONENTE PRINCIPAL ---
function App() {
  // --- ESTADO GLOBAL ---
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");

  // --- ESTADO DE DATOS ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  // --- ESTADO DE FORMULARIOS ---
  const [newProjectName, setNewProjectName] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [chatInput, setChatInput] = useState("");

  // Hook del Chat (se conecta al proyecto seleccionado)
  const { status, messages, sendMessage } = usePronoSocket(
    selectedProject?.id || null,
    token,
  );

  // --- API CALLS ---

  // 1. Load Projects
  const fetchProjects = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/projects/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
      // Select the first one by default if none selected
      if (!selectedProject && data.length > 0) setSelectedProject(data[0]);
    }
  }, [token, selectedProject]);

  // 2. Load Tasks (When project changes)
  const fetchTasks = useCallback(async () => {
    if (!token || !selectedProject) return;
    // Django Ninja endpoint for project details (includes nested tasks or separate)
    // We'll use the detail endpoint we created: GET /projects/{id}
    const res = await fetch(`${API_URL}/projects/${selectedProject.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      // Assuming the ProjectOut serializer returns 'tasks'
      setTasks(data.tasks || []);
    }
  }, [token, selectedProject]);

  // Loading effects
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // --- HANDLERS ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/token/pair`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data: AuthToken = await response.json();
        setToken(data.access);
      } else {
        alert("Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Connection error");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const res = await fetch(`${API_URL}/projects/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newProjectName }),
    });
    if (res.ok) {
      setNewProjectName("");
      fetchProjects();
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedProject) return;
    const res = await fetch(`${API_URL}/projects/${selectedProject.id}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTaskTitle }),
    });
    if (res.ok) {
      setNewTaskTitle("");
      fetchTasks(); // Reload tasks
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    const res = await fetch(`${API_URL}/projects/tasks/${taskId}/complete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      fetchTasks(); // Update local UI
      // NOTE: WebSocket notification will arrive via chat automatically ;)
    } else {
      alert("Error or insufficient permissions");
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput);
    setChatInput("");
  };

  // --- RENDER: LOGIN ---
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-3 rounded-full">
              <Server className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2">
            Prono System
          </h1>
          <p className="text-gray-400 text-center mb-6">
            Real-Time Management Platform
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER: DASHBOARD ---
  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex overflow-hidden">
      {/* 1. SIDEBAR: PROYECTOS */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center gap-2">
          <Box className="text-indigo-500" />
          <h2 className="font-bold text-lg">Projects</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {projects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => setSelectedProject(proj)}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition ${selectedProject?.id === proj.id ? "bg-indigo-600 text-white" : "hover:bg-gray-700 text-gray-300"}`}
            >
              <span className="font-medium truncate">{proj.name}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <form onSubmit={handleCreateProject} className="flex gap-2">
            <input
              className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white"
              placeholder="New project..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <button
              type="submit"
              className="bg-green-600 p-1 rounded hover:bg-green-700 text-white"
            >
              <Plus size={18} />
            </button>
          </form>
        </div>
      </aside>

      {/* 2. PANEL CENTRAL: TAREAS */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-900">
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center shadow-md z-10">
          <div>
            <h1 className="text-xl font-bold text-white">
              {selectedProject
                ? selectedProject.name
                : "Select a project"}
            </h1>
            <p className="text-xs text-gray-400">
              ID: {selectedProject?.id} • Owner ID: {selectedProject?.owner_id}
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${status === "CONNECTED" ? "bg-green-900/30 text-green-400 border-green-800" : "bg-red-900/30 text-red-400 border-red-800"}`}
          >
            {status === "CONNECTED" ? (
              <Wifi size={14} />
            ) : (
              <WifiOff size={14} />
            )}
            {status}
          </div>
        </header>

        {selectedProject ? (
          <div className="flex-1 p-6 overflow-y-auto">
            {/* New Task Form */}
            <div className="mb-8">
              <form onSubmit={handleCreateTask} className="flex gap-4">
                <input
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="What needs to be done today?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
                >
                  <Plus size={20} /> Add Task
                </button>
              </form>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {tasks.length === 0 && (
                <p className="text-gray-500 text-center mt-10">
                  No tasks yet.
                </p>
              )}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border flex items-center justify-between transition ${task.is_completed ? "bg-gray-800/50 border-gray-700 opacity-60" : "bg-gray-800 border-gray-600"}`}
                >
                  <div className="flex items-center gap-3">
                    <List
                      className={
                        task.is_completed ? "text-green-500" : "text-gray-400"
                      }
                      size={20}
                    />
                    <span
                      className={`text-lg ${task.is_completed ? "line-through text-gray-500" : "text-gray-100"}`}
                    >
                      {task.title}
                    </span>
                  </div>
                  {!task.is_completed && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white rounded-lg border border-green-600/30 transition"
                    >
                      <CheckCircle size={16} /> Complete
                    </button>
                  )}
                  {task.is_completed && (
                    <span className="text-green-500 text-sm font-medium px-3">
                      Completed
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a project to get started
          </div>
        )}
      </main>

      {/* 3. PANEL DERECHO: CHAT */}
      <aside className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col shadow-2xl">
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <h3 className="font-bold flex items-center gap-2">
            <Server size={18} className="text-indigo-400" />
            Project Activity
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50">
          {messages.map((msg, idx) => {
            const isSystem = msg.sender === "System";
            const isMe = msg.sender === username;

            if (msg.type === "connection_established") {
              return (
                <div
                  key={idx}
                  className="text-center text-xs text-gray-500 my-2"
                >
                  {msg.text}
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                {!isSystem && !isMe && (
                  <span className="text-xs text-gray-400 mb-1 ml-1">
                    {msg.sender}
                  </span>
                )}
                {isMe && !isSystem && (
                  <span className="text-xs text-indigo-400 mb-1 mr-1">Me</span>
                )}

                <div
                  className={`px-4 py-2 rounded-2xl max-w-[90%] text-sm ${isSystem
                    ? "bg-yellow-900/40 text-yellow-200 border border-yellow-700/50 w-full text-center rounded-lg"
                    : isMe
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-gray-700 text-gray-200 rounded-bl-sm"
                    }`}
                >
                  {isSystem && (
                    <strong className="block text-xs uppercase tracking-wider mb-1 text-yellow-500">
                      Notification
                    </strong>
                  )}
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-gray-800 border-t border-gray-700">
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Comment..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={!selectedProject}
            />
            <button
              type="submit"
              disabled={!selectedProject}
              className="bg-indigo-600 p-2 rounded-lg text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}

export default App;
