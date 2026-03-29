import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, Tabs, Tab, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton, Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../api';
import TaskKanban from './TaskKanban';
import TaskList from './TaskList';
import TaskCalendar from './TaskCalendar';
import TaskDetailsDialog from './TaskDetailsDialog';

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review', label: 'In Review' },
  { key: 'done', label: 'Done' }
];

const emptyForm = { 
  title: '', description: '', priority: 'medium', status: 'todo', 
  dueDate: '', project: '', subtasks: [], dependencies: [] 
};

const Tasks = () => {
  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Detail Dialog State
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchAll = async () => {
    try {
      const [tRes, pRes] = await Promise.all([api.get('/tasks'), api.get('/projects')]);
      setTasks(tRes.data || []);
      setProjects(pRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  // Form Handlers
  const handleOpen = () => { setForm(emptyForm); setOpen(true); };
  const handleClose = () => { setOpen(false); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Subtask Handlers
  const addSubtask = () => {
    setForm({ ...form, subtasks: [...form.subtasks, { title: '', status: 'pending' }] });
  };
  const handleSubtaskChange = (index, val) => {
    const updated = [...form.subtasks];
    updated[index].title = val;
    setForm({ ...form, subtasks: updated });
  };
  const removeSubtask = (index) => {
    const updated = form.subtasks.filter((_, i) => i !== index);
    setForm({ ...form, subtasks: updated });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/tasks', form);
      handleClose();
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = async (task, newStatus) => {
    try {
      await api.patch(`/tasks/${task._id}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { 
      await api.delete(`/tasks/${id}`); 
      fetchAll(); 
    } catch { 
      alert('Delete failed'); 
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h4" fontWeight="bold">Task Hub</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          New Task
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="task views">
          <Tab label="Kanban Board" />
          <Tab label="List View" />
          <Tab label="Calendar View" />
        </Tabs>
      </Box>

      {loading ? (
        <Typography color="text.secondary">Loading tasks...</Typography>
      ) : (
        <Box>
          {tabValue === 0 && <TaskKanban tasks={tasks} handleDrop={handleDrop} handleDelete={handleDelete} onTaskClick={handleTaskClick} />}
          {tabValue === 1 && <TaskList tasks={tasks} handleDelete={handleDelete} onTaskClick={handleTaskClick} />}
          {tabValue === 2 && <TaskCalendar tasks={tasks} onTaskClick={handleTaskClick} />}
        </Box>
      )}

      {/* Advanced Task Creation Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle fontWeight="bold">Create New Task</DialogTitle>
        <Box component="form" onSubmit={handleSave}>
          <DialogContent dividers>
            <Box display="flex" gap={3}>
              {/* Left Column (Primary Details) */}
              <Box flex={1}>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={2}>Primary Details</Typography>
                <TextField
                  autoFocus margin="dense" name="title" label="Task Title" type="text"
                  fullWidth required variant="outlined" value={form.title} onChange={handleChange} sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense" name="description" label="Description" type="text" multiline rows={4}
                  fullWidth variant="outlined" value={form.description} onChange={handleChange} sx={{ mb: 2 }}
                />
                <Box display="flex" gap={2} mb={2}>
                  <TextField select margin="dense" name="priority" label="Priority" fullWidth variant="outlined" value={form.priority} onChange={handleChange}>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </TextField>
                  <TextField select margin="dense" name="status" label="Status" fullWidth variant="outlined" value={form.status} onChange={handleChange}>
                    {COLUMNS.map(c => <MenuItem key={c.key} value={c.key}>{c.label}</MenuItem>)}
                  </TextField>
                </Box>
                <Box display="flex" gap={2}>
                  <TextField
                    margin="dense" name="dueDate" label="Due Date" type="date"
                    fullWidth variant="outlined" InputLabelProps={{ shrink: true }}
                    value={form.dueDate} onChange={handleChange}
                  />
                  <TextField select margin="dense" name="project" label="Project" fullWidth variant="outlined" value={form.project} onChange={handleChange}>
                    <MenuItem value="">No Project</MenuItem>
                    {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                  </TextField>
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem />

              {/* Right Column (Advanced / Subtasks) */}
              <Box flex={1}>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={2}>Dependencies & Subtasks</Typography>
                
                {/* Dependent Tasks Multi-Select (Simplified to Single for basic implementation, can expand later) */}
                <TextField select margin="dense" name="dependencies" label="Depends On" fullWidth variant="outlined" 
                  value={form.dependencies.length > 0 ? form.dependencies[0] : ''} 
                  onChange={(e) => setForm({ ...form, dependencies: e.target.value ? [e.target.value] : [] })} sx={{ mb: 3 }}>
                  <MenuItem value="">None</MenuItem>
                  {tasks.map(t => <MenuItem key={t._id} value={t._id}>{t.title}</MenuItem>)}
                </TextField>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" fontWeight="600">Subtasks</Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={addSubtask}>Add</Button>
                </Box>
                
                <Box maxHeight={200} overflow="auto" p={1} bgcolor="rgba(0,0,0,0.02)" borderRadius={1}>
                   {form.subtasks.length === 0 && <Typography variant="caption" color="text.secondary">No subtasks added.</Typography>}
                   {form.subtasks.map((st, i) => (
                     <Box key={i} display="flex" alignItems="center" gap={1} mb={1}>
                        <TextField 
                          size="small" fullWidth placeholder="Subtask title" value={st.title} 
                          onChange={(e) => handleSubtaskChange(i, e.target.value)} required 
                        />
                        <IconButton size="small" color="error" onClick={() => removeSubtask(i)}>
                          <DeleteIcon fontSize="small"/>
                        </IconButton>
                     </Box>
                   ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Create Task'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Task Details & Collaboration Hub */}
      <TaskDetailsDialog 
        open={detailOpen} 
        task={selectedTask} 
        onClose={() => setDetailOpen(false)} 
        onUpdate={fetchAll} 
      />
    </Box>
  );
};

export default Tasks;
