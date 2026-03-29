import React, { useState } from 'react';
import { 
  Paper, TableContainer, Table, TableHead, TableRow, 
  TableCell, TableBody, Typography, Chip, IconButton, Box, TableSortLabel
} from '@mui/material';
import { DeleteOutline as DeleteIcon, Assignment as AssignmentIcon } from '@mui/icons-material';

const priorityColor = { high: 'error', medium: 'warning', low: 'success' };
const statusColor = { 'todo': 'default', 'in-progress': 'info', 'review': 'warning', 'done': 'success' };

const TaskList = ({ tasks, handleDelete, onTaskClick }) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('dueDate');

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let valA = a[orderBy] ? new Date(a[orderBy]).getTime() : (a[orderBy] || '');
    let valB = b[orderBy] ? new Date(b[orderBy]).getTime() : (b[orderBy] || '');
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    
    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
          <TableRow>
            <TableCell>
              <TableSortLabel active={orderBy === 'title'} direction={orderBy === 'title' ? order : 'asc'} onClick={() => handleRequestSort('title')}>
                <b>Task</b>
              </TableSortLabel>
            </TableCell>
            <TableCell><b>Project</b></TableCell>
            <TableCell>
              <TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={() => handleRequestSort('status')}>
                <b>Status</b>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel active={orderBy === 'priority'} direction={orderBy === 'priority' ? order : 'asc'} onClick={() => handleRequestSort('priority')}>
                <b>Priority</b>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel active={orderBy === 'dueDate'} direction={orderBy === 'dueDate' ? order : 'asc'} onClick={() => handleRequestSort('dueDate')}>
                <b>Due Date</b>
              </TableSortLabel>
            </TableCell>
            <TableCell align="right"><b>Actions</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTasks.length === 0 ? (
            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>No tasks found in List View.</TableCell></TableRow>
          ) : (
            sortedTasks.map(task => (
              <TableRow key={task._id} hover onClick={() => onTaskClick(task)} sx={{ cursor: 'pointer' }}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <AssignmentIcon color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="body2" fontWeight="600">{task.title}</Typography>
                      {task.description && (
                         <Typography variant="caption" color="text.secondary">
                           {task.description.slice(0, 40)}{task.description.length > 40 ? '...' : ''}
                         </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{task.projectId?.name || '—'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={task.status.replace('-', ' ')} size="small" color={statusColor[task.status] || 'default'} sx={{textTransform: 'capitalize'}}/>
                </TableCell>
                <TableCell>
                  <Chip label={task.priority} size="small" variant="outlined" color={priorityColor[task.priority?.toLowerCase()] || 'default'} sx={{textTransform: 'capitalize'}}/>
                </TableCell>
                <TableCell>
                   <Typography variant="body2" color={task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'error.main' : 'inherit'}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                   </Typography>
                </TableCell>
                <TableCell align="right">
                   <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }}>
                     <DeleteIcon fontSize="small"/>
                   </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskList;
