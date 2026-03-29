import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, LinearProgress, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, Avatar
} from '@mui/material';
import { 
  Add as AddIcon, 
  DeleteOutline as DeleteIcon, 
  Edit as EditIcon 
} from '@mui/icons-material';
import api from '../api';

const STATUS_OPTIONS = ['Active', 'Completed', 'On-Hold'];
const emptyForm = { name: '', description: '', status: 'Active', startDate: '', endDate: '', budget: 0 };

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleOpen = () => { setForm(emptyForm); setOpen(true); };
  const handleClose = () => { setOpen(false); setError(''); };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.post('/projects', form);
      handleClose();
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try { 
      await api.delete(`/projects/${id}`); 
      fetchProjects(); 
    } catch (e) { 
      alert('Delete failed'); 
    }
  };

  const statusColor = (s) => {
    const status = s?.toLowerCase();
    if (status === 'active') return 'primary';
    if (status === 'completed') return 'success';
    if (status === 'on-hold') return 'warning';
    return 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Projects</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          New Project
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Budget</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}>Loading...</TableCell></TableRow>
            ) : projects.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No projects found. Create one!</TableCell></TableRow>
            ) : (
              projects.map((p) => {
                const isOverdue = p.endDate && new Date(p.endDate) < new Date() && p.status !== 'Completed' && p.status !== 'completed';
                return (
                <TableRow key={p._id} hover sx={isOverdue ? { bgcolor: 'error.light', '&:hover': { bgcolor: '#ffcdd2' } } : {}}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: isOverdue ? 'error.dark' : 'primary.main', width: 36, height: 36, fontSize: '1rem' }}>
                        {p.name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="600" color={isOverdue ? 'error.contrastText' : 'inherit'}>
                          {p.name} {isOverdue && <Chip size="small" label="Overdue" color="error" sx={{ml: 1, height: 18, fontSize: '0.65rem'}}/>}
                        </Typography>
                        <Typography variant="body2" color={isOverdue ? 'error.main' : 'text.secondary'}>
                          {p.description?.slice(0, 45)}{p.description?.length > 45 ? '...' : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={p.status || 'Active'} color={statusColor(p.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress 
                        variant="determinate" 
                        value={p.progress || 0} 
                        color={isOverdue ? "error" : "primary"}
                        sx={{ width: 100, height: 6, borderRadius: 3 }} 
                      />
                      <Typography variant="body2" color={isOverdue ? 'error.main' : 'text.secondary'}>{p.progress || 0}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">${(p.budget || 0).toLocaleString()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color={isOverdue ? 'error.main' : 'text.secondary'}>
                      {p.startDate ? new Date(p.startDate).toLocaleDateString() : '—'} 
                      {p.endDate && ` - ${new Date(p.endDate).toLocaleDateString()}`}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => handleDelete(p._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )})
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* New Project Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">Create New Project</DialogTitle>
        <Box component="form" onSubmit={handleSave}>
          <DialogContent dividers>
            {error && <Typography color="error" mb={2} variant="body2">{error}</Typography>}
            <TextField
              autoFocus margin="dense" name="name" label="Project Name" type="text"
              fullWidth required variant="outlined" value={form.name} onChange={handleChange} sx={{ mb: 2 }}
            />
            <TextField
              margin="dense" name="description" label="Description" type="text" multiline rows={3}
              fullWidth variant="outlined" value={form.description} onChange={handleChange} sx={{ mb: 2 }}
            />
            <Box display="flex" gap={2} mb={2}>
              <TextField
                select margin="dense" name="status" label="Status"
                fullWidth variant="outlined" value={form.status} onChange={handleChange}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
              <TextField
                margin="dense" name="budget" label="Budget ($)" type="number"
                fullWidth variant="outlined" value={form.budget} onChange={handleChange}
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                margin="dense" name="startDate" label="Start Date" type="date"
                fullWidth variant="outlined" InputLabelProps={{ shrink: true }}
                value={form.startDate} onChange={handleChange}
              />
              <TextField
                margin="dense" name="endDate" label="End Date" type="date"
                fullWidth variant="outlined" InputLabelProps={{ shrink: true }}
                value={form.endDate} onChange={handleChange}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Create Project'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Projects;
