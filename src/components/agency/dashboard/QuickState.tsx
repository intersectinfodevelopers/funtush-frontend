//app/components/agency/dashboard/QuickState.tsx
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

export default function QuickState() {
  return (
    <Box
      sx={{
        width: '100%',
        border: '1px solid #e5e7eb',
        borderRadius: 1,
        p: {
          xs: 1.5,
          sm: 2,
          md: 3,
        },
        backgroundColor: '#fff',
      }}
    >
      {/* Heading */}
      <Typography
        variant="h6"
        sx={{
          fontSize: {
            xs: 11,
            sm: 12,
            md: 14,
          },
          fontWeight: 600,
          mb: {
            xs: 1,
            sm: 1.5,
            md: 1.5,
          },
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
              py: {
                xs: 0.5,
                sm: 0.6,
                md: 0.7,
              },
            }}
          >
            {/* Icon */}
            <ListItemIcon
              sx={{
                minWidth: {
                  xs: 35,
                  sm: 45,
                  md: 60,
                },
                color: '#92969d',

                '& svg': {
                  fontSize: {
                    xs: 17,
                    sm: 20,
                    md: 24,
                  },
                },
              }}
            >
              {stat.icon}
            </ListItemIcon>

            {/* Label */}
            <ListItemText
              primary={stat.label}
              slotProps={{
                primary: {
                  sx: {
                    fontSize: {
                      xs: 10,
                      sm: 11,
                      md: 12,
                    },
                    fontWeight: 600,
                  },
                },
              }}
            />

            {/* Value */}
            <Typography
              sx={{
                fontSize: {
                  xs: 10,
                  sm: 11,
                  md: 12,
                },
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
