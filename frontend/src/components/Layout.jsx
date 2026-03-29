import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Avatar, Tooltip, Menu, MenuItem, Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  Assignment as TaskIcon,
  People as TeamIcon,
  Timeline as TimelineIcon,
  EventNote as EventNoteIcon,
  BarChart as ReportIcon,
  Notifications as NotifIcon,
  AccessTime as TimerIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const navItems = [
  { icon: <DashboardIcon />, label: 'Dashboard',  to: '/' },
  { icon: <FolderIcon />,    label: 'Projects',   to: '/projects' },
  { icon: <TaskIcon />,      label: 'Tasks',      to: '/tasks' },
  { icon: <TimelineIcon />,  label: 'Timeline',   to: '/timeline' },
  { icon: <TimerIcon />,     label: 'Timesheets', to: '/timesheets' },
  { icon: <TeamIcon />,      label: 'Team',       to: '/team' },
  { icon: <EventNoteIcon />, label: 'Resources',  to: '/resources' },
  { icon: <ReportIcon />,    label: 'Reports',    to: '/reports' },
];

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotifClick = (event) => setNotifAnchorEl(event.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          ⚡ ProManage
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ pt: 2 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
          return (
            <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.to}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  bgcolor: isActive ? 'primary.light' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.secondary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.main' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.contrastText' : 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive ? 600 : 500 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ mt: 'auto', p: 2, position: 'absolute', bottom: 0, width: '100%' }}>
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" alignItems="center" gap={1}>
           <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.875rem' }}>{initials}</Avatar>
           <Box>
             <Typography variant="subtitle2" noWrap>{user.name || 'User'}</Typography>
             <Typography variant="caption" color="text.secondary">Workspace Member</Typography>
           </Box>
        </Box>
      </Box>
    </div>
  );

  const isTimerActive = false;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Global Timer">
              <IconButton color={isTimerActive ? "error" : "inherit"}>
                <TimerIcon />
              </IconButton>
            </Tooltip>
            
            <IconButton color="inherit" onClick={handleNotifClick}>
              <Badge badgeContent={3} color="error">
                <NotifIcon />
              </Badge>
            </IconButton>

            <Menu
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={handleNotifClose}
              PaperProps={{ sx: { width: 300, mt: 1.5 } }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box p={2} borderBottom="1px solid rgba(0,0,0,0.05)">
                <Typography variant="subtitle2" fontWeight="bold">Notifications</Typography>
              </Box>
              <MenuItem onClick={handleNotifClose}>
                <Box>
                  <Typography variant="body2" fontWeight="bold">@Jane mentioned you</Typography>
                  <Typography variant="caption" color="text.secondary">In task: "Fix Backend Bug"</Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={handleNotifClose}>
                <Box>
                  <Typography variant="body2" fontWeight="bold">Task Assigned</Typography>
                  <Typography variant="caption" color="text.secondary">You were assigned to "Design UI"</Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={handleNotifClose}>
                <Box>
                  <Typography variant="body2" fontWeight="bold">Deadline Approaching</Typography>
                  <Typography variant="caption" color="text.secondary">"Server Config" is due tomorrow</Typography>
                </Box>
              </MenuItem>
              <Box p={1} textAlign="center" borderTop="1px solid rgba(0,0,0,0.05)">
                <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>Mark all as read</Typography>
              </Box>
            </Menu>

            <IconButton
              size="small"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '1rem' }}>{initials}</Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(0,0,0,0.08)' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
