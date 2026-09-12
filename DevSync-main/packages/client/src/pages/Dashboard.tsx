import { useEffect, useState, FormEvent } from 'react';
import { projectApi } from '../services/project.api';
import { useAuthStore } from '../store/authStore';

interface Project {
  _id: string;
  name: string;
  description?: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const loadProjects = async () => {
    const response = await projectApi.getAll();
    setProjects(response.data.data.projects);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await projectApi.create({ name });
    setName('');
    loadProjects();
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Hi, {user?.username}</h1>
        <button onClick={logout}>Logout</button>
      </div>

      <form onSubmit={handleCreate} style={{ marginTop: 20 }}>
        <input
          placeholder="New project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: 8, width: 300 }}
        />
        <button type="submit" style={{ marginLeft: 8, padding: 8 }}>
          Create
        </button>
      </form>

      <ul style={{ marginTop: 20 }}>
        {projects.map((p) => (
          <li key={p._id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
