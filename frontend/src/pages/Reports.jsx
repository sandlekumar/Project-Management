import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, Grid, Card, CardContent, 
  Avatar, LinearProgress 
} from '@mui/material';
import { 
  FileDownload as DownloadIcon, 
  Folder as FolderIcon,
  Assignment as TaskIcon,
  CheckCircle as DoneIcon,
  Warning as WarningIcon 
} from '@mui/icons-material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';
import api from '../api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
  const [stats, setStats] = useState({ projects: [], tasks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, tRes] = await Promise.all([api.get('/projects'), api.get('/tasks')]);
        setStats({ projects: pRes.data || [], tasks: tRes.data || [] });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const { projects, tasks } = stats;

  const taskByStatusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length },
  ];
  const taskStatusColors = ['#94a3b8', '#06b6d4', '#f59e0b', '#10b981'];

  const taskByPriorityData = [
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
  ];
  const priorityColors = ['#10b981', '#f59e0b', '#ef4444'];

  const projByStatusData = [
    { name: 'Active', value: projects.filter(p => p.status === 'Active' || p.status === 'active').length },
    { name: 'Completed', value: projects.filter(p => p.status === 'Completed' || p.status === 'completed').length },
    { name: 'On-Hold', value: projects.filter(p => p.status === 'On-Hold' || p.status === 'on-hold').length },
  ];
  const projColors = ['#1976d2', '#2e7d32', '#ed6c02'];

  const exportCSV = (data, filename) => {
    if (!data.length) return alert('No data to export');
    const keys = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
    const csv  = [keys.join(','), ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    Object.assign(a, { href: url, download: filename });
    a.click(); 
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Project Management System - Master Report', 14, 20);
    
    doc.text('Project Summaries', 14, 30);
    const projData = projects.map(p => [p.name, p.status, `${p.progress}%`, p.budget]);
    doc.autoTable({ startY: 35, head: [['Project', 'Status', 'Progress', 'Budget']], body: projData });
    
    doc.text('Task Summaries', 14, doc.autoTable.previous.finalY + 15);
    const taskData = tasks.slice(0, 50).map(t => [t.title, t.status, t.priority, t.projectName || '—']);
    doc.autoTable({ startY: doc.autoTable.previous.finalY + 20, head: [['Task', 'Status', 'Priority', 'Project']], body: taskData });
    
    doc.save('PM_Report.pdf');
  };

  if (loading) return <Typography>Loading reports...</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Reports & Analytics</Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportCSV(tasks, 'tasks.csv')}>
            CSV (Tasks)
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportPDF} color="error">
            Export PDF Report
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        {[
          { label: 'Total Projects', value: projects.length, icon: <FolderIcon />, color: '#1976d2', bg: '#e3f2fd' },
          { label: 'Total Tasks', value: tasks.length, icon: <TaskIcon />, color: '#9c27b0', bg: '#f3e5f5' },
          { label: 'Completed Tasks', value: taskByStatusData[3].value, icon: <DoneIcon />, color: '#2e7d32', bg: '#e8f5e9' },
          { label: 'High Priority', value: taskByPriorityData[2].value, icon: <WarningIcon />, color: '#d32f2f', bg: '#ffebee' },
        ].map((s, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3, '&:last-child': { pb: 3 } }}>
                <Avatar sx={{ bgcolor: s.bg, color: s.color, width: 56, height: 56, mr: 2 }}>
                  {s.icon}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight="500">{s.label}</Typography>
                  <Typography variant="h4" fontWeight="bold">{s.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', p: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Tasks by Status</Typography>
            <Box height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskByStatusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {taskByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={taskStatusColors[index % taskStatusColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', p: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Tasks by Priority</Typography>
            <Box height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskByPriorityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {taskByPriorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={priorityColors[index % priorityColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', p: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Projects by Status</Typography>
            <Box height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projByStatusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {projByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={projColors[index % projColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>Project Progress Overview</Typography>
            <Box display="flex" flexDirection="column" gap={3}>
              {projects.length === 0 && <Typography color="text.secondary">No projects available.</Typography>}
              {projects.slice(0, 5).map(p => (
                <Box key={p._id}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" fontWeight="500">{p.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{p.progress || 0}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={p.progress || 0} 
                    sx={{ height: 8, borderRadius: 4 }} 
                    color={p.progress === 100 ? 'success' : 'primary'}
                  />
                </Box>
              ))}
            </Box>
            {projects.length > 5 && (
              <Button sx={{ mt: 2 }} component={RouterLink} to="/projects">View all projects</Button>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
