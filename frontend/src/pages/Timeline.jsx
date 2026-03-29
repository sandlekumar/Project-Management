import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, CircularProgress
} from '@mui/material';
import api from '../api';
import { format, differenceInDays, min, max, addDays } from 'date-fns';

const Timeline = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get('/tasks');
        setTasks((data || []).filter(t => t.dueDate)); // Need dates to show on timeline
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) return <Box p={3} textAlign="center"><CircularProgress /></Box>;
  if (tasks.length === 0) return <Box p={3}><Typography>No tasks with due dates available for Timeline.</Typography></Box>;

  // Basic Gantt Logic
  // Assuming a start date of CreatedAt or 7 days before dueDate if not present
  const tasksWithDates = tasks.map(t => {
    const end = new Date(t.dueDate);
    const start = t.createdAt ? new Date(t.createdAt) : addDays(end, -3);
    return { ...t, start, end };
  }).sort((a,b) => a.start - b.start);

  const minDate = min(tasksWithDates.map(t => t.start));
  const maxDate = max(tasksWithDates.map(t => t.end));
  const totalDays = Math.max(differenceInDays(maxDate, minDate), 1);

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>Project Timeline (Gantt)</Typography>
      <Paper elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', p: 3, overflowX: 'auto' }}>
        <Box minWidth={800}>
          {/* Header row (Dates) */}
          <Box display="flex" borderBottom="1px solid rgba(0,0,0,0.1)" pb={1} mb={2}>
            <Box width="200px" flexShrink={0} fontWeight="bold">Task Name</Box>
            <Box flexGrow={1} position="relative" display="flex" justifyContent="space-between">
              <Typography variant="caption">{format(minDate, 'MMM dd, yyyy')}</Typography>
              <Typography variant="caption">Time -&gt; </Typography>
              <Typography variant="caption">{format(maxDate, 'MMM dd, yyyy')}</Typography>
            </Box>
          </Box>

          {/* Task Rows */}
          {tasksWithDates.map(task => {
            const startOffset = Math.max(differenceInDays(task.start, minDate), 0);
            const duration = Math.max(differenceInDays(task.end, task.start), 1);
            
            const leftPercent = (startOffset / totalDays) * 100;
            const widthPercent = (duration / totalDays) * 100;

            const barColor = task.status === 'done' || task.status === 'Completed' ? '#2e7d32' 
                           : task.status === 'in-progress' ? '#ed6c02' 
                           : '#1976d2';

            return (
              <Box key={task._id} display="flex" alignItems="center" mb={1.5}>
                <Box width="200px" flexShrink={0} pr={2}>
                  <Typography variant="body2" noWrap title={task.title}>{task.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{format(task.start, 'MMM dd')} - {format(task.end, 'MMM dd')}</Typography>
                </Box>
                <Box flexGrow={1} position="relative" height={30} bgcolor="rgba(0,0,0,0.02)" borderRadius={1}>
                  <Box 
                    sx={{
                      position: 'absolute',
                      left: `${leftPercent}%`,
                      width: `${Math.min(widthPercent, 100 - leftPercent)}%`,
                      height: '100%',
                      bgcolor: barColor,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      px: 1,
                      color: 'white',
                      fontSize: '0.75rem',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {duration} days
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
};

export default Timeline;
