import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const TaskCalendar = ({ tasks, onTaskClick }) => {
  // Map tasks to events
  const events = tasks.map(t => {
    // Basic fallback logic: if no start, use due date - 1 hr or same as end.
    let start = t.startDate ? new Date(t.startDate) : t.dueDate ? new Date(t.dueDate) : new Date();
    let end = t.dueDate ? new Date(t.dueDate) : new Date();
    
    // If start == end, give it a 1 hr duration so it shows up in day views nicely
    if (start.getTime() === end.getTime()) {
      end.setHours(end.getHours() + 1);
    }

    return {
      title: t.title,
      start,
      end,
      allDay: true, // Typical tasks are usually all-day events representing due dates
      resource: t
    };
  });

  const eventStyleGetter = (event) => {
    const task = event.resource;
    let backgroundColor = '#1976d2'; // Default primary
    
    if (task.status === 'done') backgroundColor = '#2e7d32'; // Success Green
    else if (task.status === 'in-progress') backgroundColor = '#ed6c02'; // Warning Orange
    else if (task.priority === 'high' && task.status !== 'done') backgroundColor = '#d32f2f'; // Error Red for urgent todo
    
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ height: 600 }}>
        {tasks.length === 0 ? (
           <Box display="flex" justifyContent="center" alignItems="center" height="100%">
             <Typography color="text.secondary">No tasks available for Calendar.</Typography>
           </Box>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', fontFamily: 'inherit', cursor: 'pointer' }}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day']}
            defaultView="month"
            onSelectEvent={(e) => onTaskClick(e.resource)}
          />
        )}
      </Box>
    </Paper>
  );
};

export default TaskCalendar;
