import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, Box, Typography, Button, 
  Divider, TextField, List, ListItem, ListItemAvatar, Avatar,
  ListItemText, Grid, Chip, IconButton
} from '@mui/material';
import { 
  PlayArrow as PlayIcon, Stop as StopIcon, AttachFile as AttachmentIcon,
  Close as CloseIcon, Send as SendIcon 
} from '@mui/icons-material';
import api from '../api';

const MENTION_REGEX = /@[a-zA-Z0-9_]+/g;

const TaskDetailsDialog = ({ open, task, onClose, onUpdate }) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [timerActive, setTimerActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  
  useEffect(() => {
    if (task) {
      setComments(task.comments || []);
      // Reset timer visual for demo (In real implementation, track via backend/localStorage timestamps)
      setTimerActive(false); 
      setElapsedTime(0);
    }
  }, [task]);

  // Timer Effect
  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      // Simulate checking for mentions
      const mentions = commentText.match(MENTION_REGEX) || [];
      if (mentions.length > 0) {
        // Here you would trigger notification creation for each mapped user
        console.log("Mentioned users:", mentions);
      }

      const newComments = [...comments, { 
        author: JSON.parse(localStorage.getItem('user') || '{}').name || 'You',
        text: commentText,
        timestamp: new Date().toISOString()
      }];
      
      await api.patch(`/tasks/${task._id}`, { comments: newComments });
      setComments(newComments);
      setCommentText('');
      if(onUpdate) onUpdate();
    } catch (e) {
      console.error("Failed to add comment", e);
    }
  };

  // Basic styling for @mentions in text display
  const renderCommentText = (text) => {
    if (!text) return '';
    const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => 
      part.startsWith('@') ? <Typography key={i} component="span" color="primary" fontWeight="bold">{part}</Typography> 
                           : <span key={i}>{part}</span>
    );
  };

  if (!task) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">{task.title}</Typography>
          <Typography variant="caption" color="text.secondary">In project: {task.projectId?.name || 'Unassigned'}</Typography>
        </Box>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Grid container sx={{ height: '100%' }}>
          
          {/* Main Content Area */}
          <Grid item xs={12} md={8} sx={{ borderRight: '1px solid rgba(0,0,0,0.08)', p: 3 }}>
            <Box mb={4}>
              <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={1}>Description</Typography>
              <Typography variant="body2">{task.description || 'No description provided.'}</Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Subtasks */}
            <Box mb={4}>
              <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={1}>Subtasks ({task.subtasks?.length || 0})</Typography>
              {task.subtasks?.map((st, i) => (
                <Box key={i} display="flex" alignItems="center" gap={1} mb={1}>
                  <Chip size="small" label={st.status} color={st.status === 'done' ? 'success' : 'default'} />
                  <Typography variant="body2" sx={{ textDecoration: st.status === 'done' ? 'line-through' : 'none' }}>{st.title}</Typography>
                </Box>
              ))}
              {(!task.subtasks || task.subtasks.length === 0) && <Typography variant="caption" color="text.secondary">No subtasks found.</Typography>}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Comments & Activity Feed */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={2}>Comments & Activity</Typography>
              <List sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
                {comments.length === 0 && <Typography variant="caption" color="text.secondary">No comments yet. Start the conversation!</Typography>}
                {comments.map((c, i) => (
                  <ListItem key={i} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar><Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.8rem' }}>{c.author?.[0] || 'U'}</Avatar></ListItemAvatar>
                    <ListItemText 
                      primary={<Box display="flex" gap={1}><Typography variant="subtitle2" fontWeight="bold">{c.author}</Typography><Typography variant="caption" color="text.secondary">{new Date(c.timestamp).toLocaleString()}</Typography></Box>}
                      secondary={<Typography variant="body2" color="text.primary" mt={0.5}>{renderCommentText(c.text)}</Typography>}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Box display="flex" gap={1}>
                <TextField 
                  fullWidth variant="outlined" size="small" placeholder="Add a comment... Type @ to mention someone"
                  value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button variant="contained" color="primary" onClick={handleAddComment} sx={{ minWidth: 40 }}><SendIcon fontSize="small" /></Button>
              </Box>
            </Box>
          </Grid>
          
          {/* Right Sidebar (Meta & Tools) */}
          <Grid item xs={12} md={4} sx={{ p: 3, bgcolor: '#f8fafc' }}>
            
            {/* Timer Hub */}
            <Box mb={3} p={2} bgcolor="white" borderRadius={2} border="1px solid rgba(0,0,0,0.05)" textAlign="center">
              <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" mb={1}>TASK TIMER (H:M:S)</Typography>
              <Typography variant="h4" fontWeight="bold" color={timerActive ? 'primary.main' : 'text.primary'} mb={2}>
                {formatTime(elapsedTime)}
              </Typography>
              <Box display="flex" justifyContent="center" gap={1}>
                <Button 
                  variant={timerActive ? 'outlined' : 'contained'} 
                  color={timerActive ? 'error' : 'success'}
                  startIcon={timerActive ? <StopIcon /> : <PlayIcon />}
                  onClick={() => setTimerActive(!timerActive)}
                  fullWidth
                >
                  {timerActive ? 'Stop Timer' : 'Start Timer'}
                </Button>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Properties */}
            <Box mb={3}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" mb={1}>PROPERTIES</Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Status</Typography>
                <Chip label={task.status} size="small" sx={{ textTransform: 'capitalize' }} />
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Priority</Typography>
                <Chip label={task.priority} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} color={task.priority === 'high' ? 'error' : 'default'} />
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Due Date</Typography>
                <Typography variant="body2" fontWeight="500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Attachments */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" mb={1}>ATTACHMENTS</Typography>
              <Button fullWidth variant="outlined" startIcon={<AttachmentIcon />} sx={{ borderStyle: 'dashed' }}>
                Upload File
              </Button>
              {task.attachments?.map((att, i) => (
                <Box key={i} mt={1} p={1} bgcolor="white" border="1px solid rgba(0,0,0,0.05)" borderRadius={1} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" noWrap>{att.name || 'file.txt'}</Typography>
                  <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>Download</Typography>
                </Box>
              ))}
            </Box>

          </Grid>

        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;
