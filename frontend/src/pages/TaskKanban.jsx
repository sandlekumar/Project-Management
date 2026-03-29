import React, { useState } from 'react';
import { Box, Paper, Grid, Card, CardContent, Typography, Chip, IconButton } from '@mui/material';
import { DeleteOutline as DeleteIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: '#94a3b8' },
  { key: 'in-progress', label: 'In Progress', color: '#06b6d4' },
  { key: 'review', label: 'In Review', color: '#f59e0b' },
  { key: 'done', label: 'Done', color: '#10b981' },
];

const priorityProps = {
  high: { label: 'High', color: 'error' },
  medium: { label: 'Medium', color: 'warning' },
  low: { label: 'Low', color: 'success' },
};

const TaskKanban = ({ tasks, handleDrop, handleDelete, onTaskClick }) => {
  const [dragging, setDragging] = useState(null);

  const onDropWrapper = (e, newStatus) => {
    e.preventDefault();
    if (!dragging || dragging.status === newStatus) return;
    handleDrop(dragging, newStatus);
    setDragging(null);
  };

  return (
    <Grid container spacing={2} sx={{ minHeight: '60vh', alignItems: 'stretch' }}>
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key);
        return (
          <Grid item xs={12} sm={6} md={3} key={col.key} sx={{ display: 'flex' }}>
            <Paper 
              elevation={0}
              sx={{ 
                bgcolor: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 2, display: 'flex', flexDirection: 'column',
                width: '100%', height: '100%', p: 2
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDropWrapper(e, col.key)}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: col.color }} />
                  {col.label}
                </Typography>
                <Chip label={colTasks.length} size="small" />
              </Box>

              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {colTasks.length === 0 ? (
                  <Box flexGrow={1} display="flex" alignItems="center" justifyContent="center">
                    <Typography variant="body2" color="text.secondary">Drop cards here</Typography>
                  </Box>
                ) : (
                  colTasks.map(task => (
                    <Card 
                      key={task._id}
                      elevation={1}
                      draggable
                      onDragStart={() => setDragging(task)}
                      onDragEnd={() => setDragging(null)}
                      sx={{ 
                        cursor: 'grab', 
                        '&:active': { cursor: 'grabbing' },
                        opacity: dragging?._id === task._id ? 0.5 : 1,
                        borderTop: `4px solid ${priorityProps[task.priority?.toLowerCase() || 'medium'].color === 'error' ? '#ef4444' : priorityProps[task.priority?.toLowerCase() || 'medium'].color === 'warning' ? '#f59e0b' : '#10b981'}`
                      }}
                      onClick={() => onTaskClick(task)}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>{task.title}</Typography>
                          <IconButton size="small" color="error" onClick={() => handleDelete(task._id)} sx={{ mt: -1, mr: -1 }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        {task.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem' }}>
                            {task.description.slice(0, 50)}{(task.description.length > 50 ? '...' : '')}
                          </Typography>
                        )}
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Chip 
                            label={priorityProps[task.priority?.toLowerCase() || 'medium'].label} 
                            size="small" 
                            color={priorityProps[task.priority?.toLowerCase() || 'medium'].color} 
                            sx={{ height: 20, fontSize: '0.7rem' }} 
                          />
                          {task.dueDate && (
                            <Box display="flex" alignItems="center" color="text.secondary" gap={0.5}>
                              <CalendarIcon sx={{ fontSize: '0.9rem' }} />
                              <Typography variant="caption">{new Date(task.dueDate).toLocaleDateString()}</Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default TaskKanban;
