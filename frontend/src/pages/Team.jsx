import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Avatar, 
  Chip, Divider 
} from '@mui/material';
import api from '../api';

const Team = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data } = await api.get('/auth/users').catch(() => ({ data: [] }));
        setMembers(data || []);
      } catch { 
        setMembers([]); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchMembers();
  }, []);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const displayMembers = members.length > 0 ? members : [currentUser].filter(m => m._id || m.name);

  const getRoleColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'developer': return 'primary';
      case 'designer': return 'info';
      case 'tester': return 'success';
      default: return 'default';
    }
  };

  const getAvatarColor = (index) => {
    const colors = ['#1976d2', '#9c27b0', '#d32f2f', '#ed6c02', '#2e7d32'];
    return colors[index % colors.length];
  };

  if (loading) return <Typography color="text.secondary">Loading team...</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Team</Typography>
        <Chip label={`${displayMembers.length} Member${displayMembers.length !== 1 ? 's' : ''}`} color="primary" />
      </Box>

      {displayMembers.length === 0 ? (
        <Box textAlign="center" py={8} color="text.secondary">
          <Typography variant="h1" mb={2}>👥</Typography>
          <Typography>No team members found.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {displayMembers.map((member, i) => {
            const initials = (member.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={member._id || i}>
                <Card elevation={1} sx={{ textAlign: 'center', height: '100%', borderRadius: 2 }}>
                  <Box sx={{ height: 80, bgcolor: getAvatarColor(i) }} />
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -6 }}>
                    <Avatar 
                      sx={{ 
                        width: 80, height: 80, mb: 2, 
                        border: '4px solid white', 
                        bgcolor: getAvatarColor(i),
                        fontSize: '2rem'
                      }}
                    >
                      {initials}
                    </Avatar>
                    
                    <Typography variant="h6" fontWeight="bold">{member.name || 'Unknown'}</Typography>
                    <Typography variant="body2" color="text.secondary">{member.email || '—'}</Typography>
                    
                    <Chip 
                      label={member.role || 'Member'} 
                      color={getRoleColor(member.role)}
                      size="small"
                      sx={{ mt: 2, textTransform: 'capitalize' }}
                    />
                    
                    <Divider sx={{ width: '100%', my: 2 }} />
                    
                    <Box display="flex" justifyContent="space-around" width="100%">
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Joined</Typography>
                        <Typography variant="body2" fontWeight="500">
                          {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Status</Typography>
                        <Typography variant="body2" fontWeight="500" color="success.main">Active</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default Team;
