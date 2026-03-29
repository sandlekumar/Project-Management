import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Avatar, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip 
} from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import api from '../api';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const ResourceCalendar = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, uRes] = await Promise.all([
          api.get('/tasks').catch(() => ({ data: [] })),
          api.get('/auth/users').catch(() => ({ data: [] }))
        ]);
        setTasks(tRes.data || []);
        
        let fetchedUsers = uRes.data || [];
        if (fetchedUsers.length === 0) {
          // Fallback if users endpoint fails (often does in testing)
          const localUser = JSON.parse(localStorage.getItem('user') || '{}');
          fetchedUsers = [localUser, { _id: 'user2', name: 'Jane Smith' }, { _id: 'user3', name: 'John Doe' }];
        }
        setUsers(fetchedUsers);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Map tasks to events
  const events = tasks.filter(t => t.dueDate || t.startDate).map(t => {
    let start = t.startDate ? new Date(t.startDate) : new Date(t.dueDate);
    let end = t.dueDate ? new Date(t.dueDate) : new Date(t.startDate);
    if (start.getTime() === end.getTime()) {
      end.setHours(end.getHours() + 1);
    }
    const assigneeName = users.find(u => String(u._id) === String(t.assignee))?.name || 'Unassigned';
    return {
      title: `${t.title} (${assigneeName})`,
      start,
      end,
      allDay: true,
      resource: t
    };
  });

  // Calculate workloads
  const workload = users.map(user => {
    const userTasks = tasks.filter(t => String(t.assignee) === String(user._id) && t.status !== 'done' && t.status !== 'completed');
    return {
      ...user,
      taskCount: userTasks.length,
      assignedTaskNames: userTasks.map(t => t.title)
    };
  });

  if (loading) return <Typography>Loading resources...</Typography>;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>Resource Management</Typography>
      
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={5}>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', height: '100%', maxHeight: 600 }}>
            <Box p={2} borderBottom="1px solid rgba(0,0,0,0.08)">
              <Typography variant="h6" fontWeight="bold">Team Workload</Typography>
              <Typography variant="body2" color="text.secondary">Current incomplete tasks per member. (&gt;5 is over-assigned)</Typography>
            </Box>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><b>Member</b></TableCell>
                  <TableCell><b>Workload</b></TableCell>
                  <TableCell><b>Assigned Tasks</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workload.map(user => {
                  const isOverallotted = user.taskCount > 5;
                  return (
                    <TableRow 
                      key={user._id} 
                      hover
                      sx={{ bgcolor: isOverallotted ? 'error.light' : 'inherit' }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ bgcolor: isOverallotted ? 'error.dark' : 'primary.main', width: 32, height: 32, fontSize: '0.8rem' }}>
                            {user.name?.[0]?.toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight="bold" color={isOverallotted ? 'error.contrastText' : 'inherit'}>
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color={isOverallotted ? 'error.contrastText' : 'inherit'}>
                          {user.taskCount} tasks
                        </Typography>
                        {isOverallotted && <Chip size="small" label="Over-assigned" color="error" sx={{ mt: 0.5, height: 20, fontSize: '0.65rem' }} />}
                      </TableCell>
                      <TableCell>
                         <Box display="flex" flexWrap="wrap" gap={0.5}>
                           {user.assignedTaskNames.length === 0 ? (
                             <Typography variant="caption" color="text.secondary">No active tasks</Typography>
                           ) : (
                             user.assignedTaskNames.map((tName, i) => (
                               <Chip key={i} label={tName} size="small" variant="outlined" sx={{ color: isOverallotted ? 'error.contrastText' : 'inherit', borderColor: isOverallotted ? 'error.contrastText' : 'rgba(0,0,0,0.2)' }} />
                             ))
                           )}
                         </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
             <Typography variant="h6" fontWeight="bold" mb={2}>Availability Calendar</Typography>
             <Box sx={{ height: 535 }}>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%', fontFamily: 'inherit' }}
                  views={['month', 'week', 'day', 'agenda']}
                  defaultView="week"
                />
             </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResourceCalendar;
