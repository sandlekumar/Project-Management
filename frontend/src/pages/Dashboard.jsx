import React, { useEffect, useState } from 'react';
import { 
  Box, Grid, Card, CardContent, Typography, Avatar, 
  Chip, LinearProgress, Divider, List, ListItem, 
  ListItemAvatar, ListItemText, CircularProgress, Button, IconButton
} from '@mui/material';
import { 
  Folder as FolderIcon, 
  Assignment as TaskIcon, 
  CheckCircle as DoneIcon, 
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreIcon, 
  CheckCircle as CheckCircleIcon,
  Comment as CommentIcon, 
  Assignment as AssignmentIcon 
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats]       = useState({ projects: 0, tasks: 0, completed: 0, members: 0 });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, tRes] = await Promise.all([api.get('/projects'), api.get('/tasks')]);
        const p = pRes.data || [];
        const t = tRes.data || [];
        setProjects(p.slice(0, 4));
        setTasks(t.slice(0, 5));
        setStats({
          projects: p.length,
          tasks: t.length,
          completed: t.filter(x => x.status === 'done' || x.status === 'completed' || x.status === 'Done').length,
          members: new Set(t.map(x => x.assignee)).size || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = [
    { title: 'Total Projects', value: stats.projects, icon: <FolderIcon />, color: '#1976d2', bg: '#e3f2fd' },
    { title: 'Total Tasks', value: stats.tasks, icon: <TaskIcon />, color: '#ed6c02', bg: '#fff3e0' },
    { title: 'Completed', value: stats.completed, icon: <DoneIcon />, color: '#2e7d32', bg: '#e8f5e9' },
    { title: 'Team Members', value: stats.members, icon: <PeopleIcon />, color: '#9c27b0', bg: '#f3e5f5' },
  ];

  const priorityColor = (p) => ({ high: 'error', medium: 'warning', low: 'success' })[p?.toLowerCase()] || 'info';
  const statusColor = (s) => {
    const status = s?.toLowerCase();
    if (status === 'active' || status === 'in progress') return 'info';
    if (status === 'completed' || status === 'done') return 'success';
    return 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">
            Good morning, {user.name?.split(' ')[0] || 'User'}! Here's your workspace overview.
          </Typography>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} mb={4}>
        {statCards.map((s, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3, '&:last-child': { pb: 3 } }}>
                <Avatar sx={{ bgcolor: s.bg, color: s.color, width: 56, height: 56, mr: 2 }}>
                  {s.icon}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight="500">{s.title}</Typography>
                  <Typography variant="h4" fontWeight="bold">{s.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Recent Projects */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2} borderBottom="1px solid rgba(0,0,0,0.08)">
              <Typography variant="h6" fontWeight="bold">Recent Projects</Typography>
              <Button component={RouterLink} to="/projects" size="small" variant="text">View All</Button>
            </Box>
            <List sx={{ p: 0 }}>
              {projects.length === 0 && <ListItem><ListItemText secondary="No projects found." /></ListItem>}
              {projects.map((p, i) => (
                <React.Fragment key={p._id}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', fontSize: '1rem' }}>
                        {p.name?.[0]?.toUpperCase() || 'P'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={<Typography fontWeight="600">{p.name}</Typography>}
                      secondary={p.description?.slice(0, 45) + (p.description?.length > 45 ? '...' : '') || 'No description'} 
                    />
                    <Box sx={{ width: 120, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Chip label={p.status || 'Active'} size="small" color={statusColor(p.status)} sx={{ fontWeight: 600, height: 20 }} />
                      <Box width="100%" display="flex" alignItems="center" gap={1}>
                        <LinearProgress variant="determinate" value={p.progress || 0} sx={{ width: '100%', height: 6, borderRadius: 3 }} />
                        <Typography variant="caption" fontWeight="bold">{p.progress || 0}%</Typography>
                      </Box>
                    </Box>
                  </ListItem>
                  {i < projects.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Grid>

        {/* Recent Tasks */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2} borderBottom="1px solid rgba(0,0,0,0.08)">
              <Typography variant="h6" fontWeight="bold">Recent Tasks</Typography>
              <Button component={RouterLink} to="/tasks" size="small" variant="text">View All</Button>
            </Box>
            <List sx={{ p: 0 }}>
              {tasks.length === 0 && <ListItem><ListItemText secondary="No tasks found." /></ListItem>}
              {tasks.map((t, i) => (
                <React.Fragment key={t._id}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemText 
                      primary={<Typography fontWeight="600">{t.title}</Typography>}
                      secondary={t.dueDate ? `Due: ${new Date(t.dueDate).toLocaleDateString()}` : 'No due date'} 
                    />
                    <Box display="flex" gap={1}>
                      <Chip label={t.priority || 'Medium'} size="small" color={priorityColor(t.priority)} variant="outlined" />
                      <Chip label={t.status || 'To Do'} size="small" color={statusColor(t.status)} />
                    </Box>
                  </ListItem>
                  {i < tasks.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Grid>
        
        {/* Activity Feed Box */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>Activity Feed</Typography>
              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemAvatar><Avatar sx={{ bgcolor: 'secondary.light' }}><CheckCircleIcon fontSize="small" /></Avatar></ListItemAvatar>
                  <ListItemText primary={<Typography variant="body2"><b>John</b> completed task <b>Database Setup</b></Typography>} secondary="10 mins ago" />
                </ListItem>
                <Divider component="li" />
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemAvatar><Avatar sx={{ bgcolor: 'primary.light' }}><CommentIcon fontSize="small" /></Avatar></ListItemAvatar>
                  <ListItemText primary={<Typography variant="body2"><b>Sarah</b> commented on <b>API Docs</b></Typography>} secondary="1 hour ago" />
                </ListItem>
                <Divider component="li" />
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemAvatar><Avatar sx={{ bgcolor: 'warning.light' }}><AssignmentIcon fontSize="small" /></Avatar></ListItemAvatar>
                  <ListItemText primary={<Typography variant="body2"><b>Alex</b> created project <b>Mobile App</b></Typography>} secondary="3 hours ago" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
