'use client';

import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';

import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PersonIcon from '@mui/icons-material/Person';

const quickStats = [
  {
    label: 'New Inquires',
    value: 8,
    icon: <AddBoxOutlinedIcon />,
  },
  {
    label: 'Unread Message',
    value: 12,
    icon: <ChatBubbleIcon />,
  },
  {
    label: 'Reviews Received',
    value: 24,
    icon: <StarBorderIcon />,
  },
  {
    label: 'Blog Posts',
    value: 6,
    icon: <ArticleOutlinedIcon />,
  },
  {
    label: 'Staff On Leave',
    value: 3,
    icon: <PersonIcon />,
  },
];

export default function QuickStats() {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 400,
        border: '1px solid #e5e7eb',
        borderRadius: 1,
        p: 3,
        backgroundColor: '#fff',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontSize: 12,
          fontWeight: 600,
          mb: 1.5,
        }}
      >
        Quick State
      </Typography>

      <List disablePadding>
        {quickStats.map((stat) => (
          <ListItem
            key={stat.label}
            disableGutters
            sx={{
              py: 0.7,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 60,
                color: '#92969d',
              }}
            >
              {stat.icon}
            </ListItemIcon>

            <ListItemText
              primary={stat.label}
              slotProps={{
                primary: {
                  sx: {
                    fontSize: 12,
                    fontWeight: 600,
                  },
                },
              }}
            />

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {stat.value}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
