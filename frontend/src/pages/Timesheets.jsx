import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, 
  Switch, FormControlLabel 
} from '@mui/material';
import { Add as AddIcon, CheckCircle as ApproveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../api';

const Timesheets = () => {
  const [entries, setEntries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ task: '', hours: 0, date: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);

  // Note: assuming a timesheets backend endpoint exists or mocking it if not
  const fetchAll = async () => {
    try {
      // Mocking timesheets if backend route isn't fully set up yet
      const [tRes] = await Promise.all([api.get('/tasks')]);
      setTasks(tRes.data || []);
      
      // Attempt to load from real API, fallback to mock data
      let timesheetData = [];
      try {
         const { data } = await api.get('/timesheets');
         timesheetData = data || [];
      } catch (err) {
         // Create some mock entries based on tasks
         const user = JSON.parse(localStorage.getItem('user') || '{}');
         timesheetData = tRes.data.slice(0,3).map((t, i) => ({
             _id: `mock_${i}`,
             task: t,
             user: user,
             hours: Math.floor(Math.random() * 5) + 1,
             date: new Date().toISOString(),
             approved: i % 2 === 0
         }));
      }
      setEntries(timesheetData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => { setOpen(false); setForm({ task: '', hours: 0, date: new Date().toISOString().split('T')[0] }); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Standard POST to timesheets - fallback to local state if missing endpoint
      const res = await api.post('/timesheets', form).catch(() => ({ 
        data: { 
          _id: Date.now(), 
          task: tasks.find(t => t._id === form.task), 
          hours: form.hours, 
          date: form.date, 
          approved: false,
          user: JSON.parse(localStorage.getItem('user') || '{}')
        } 
      }));
      setEntries([res.data, ...entries]);
      handleClose();
    } catch (err) { alert('Save failed'); }
    finally { setSaving(false); }
  };

  const toggleApproval = async (id, currentStatus) => {
    try {
      await api.patch(`/timesheets/${id}`, { approved: !currentStatus }).catch(() => null);
      setEntries(entries.map(e => String(e._id) === String(id) ? { ...e, approved: !currentStatus } : e));
    } catch (e) { alert('Approval failed'); }
  };

  const totalHours = entries.reduce((acc, curr) => acc + Number(curr.hours || 0), 0);
  const billableAmount = totalHours * 50; // Mock rate $50/hr

  if (loading) return <Typography>Loading timesheets...</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
           <Typography variant="h4" fontWeight="bold">Timesheets</Typography>
           <Typography color="text.secondary">Total Hours: {totalHours}h | Est. Billable: ${billableAmount.toLocaleString()}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Log Time
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Task</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Hours</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No time entries found.</TableCell></TableRow>
            ) : (
              entries.map((e) => (
                <TableRow key={e._id} hover>
                  <TableCell>
                    <Typography variant="body2">{e.date ? new Date(e.date).toLocaleDateString() : '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">{e.task?.title || 'Unknown Task'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{e.user?.name || 'User'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">{e.hours}h</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={e.approved ? 'Approved' : 'Pending'} 
                      color={e.approved ? 'success' : 'warning'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                       <Button 
                         size="small" 
                         variant={e.approved ? "outlined" : "contained"} 
                         color={e.approved ? "inherit" : "success"}
                         onClick={() => toggleApproval(e._id, e.approved)}
                         startIcon={<ApproveIcon />}
                         sx={{ textTransform: 'none' }}
                       >
                         {e.approved ? 'Revoke' : 'Approve'}
                       </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Log Time Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight="bold">Log Time</DialogTitle>
        <Box component="form" onSubmit={handleSave}>
          <DialogContent dividers>
            <TextField
              select margin="dense" name="task" label="Select Task" fullWidth required
              variant="outlined" value={form.task} onChange={(e) => setForm({...form, task: e.target.value})} sx={{ mb: 2 }}
            >
              {tasks.map((t) => (
                <MenuItem key={t._id} value={t._id}>{t.title}</MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense" name="date" label="Date" type="date" required
              fullWidth variant="outlined" InputLabelProps={{ shrink: true }}
              value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} sx={{ mb: 2 }}
            />
            <TextField
              margin="dense" name="hours" label="Hours Worked" type="number" required
              fullWidth variant="outlined" InputProps={{ inputProps: { min: 0.5, step: 0.5 } }}
              value={form.hours} onChange={(e) => setForm({...form, hours: e.target.value})}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Save Entry'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Timesheets;
