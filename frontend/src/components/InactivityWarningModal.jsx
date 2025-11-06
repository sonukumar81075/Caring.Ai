import React from 'react';
import { Modal, Box, Typography, Button, LinearProgress } from '@mui/material';
import { AlertCircle, LogOut, MousePointer } from 'lucide-react';

const InactivityWarningModal = ({ open, remainingTime, onStayActive, onLogout }) => {
  const progress = (remainingTime / 15) * 100; // Assuming 15 seconds warning time

  return (
    <Modal
      open={open}
      onClose={onStayActive}
      aria-labelledby="inactivity-warning-modal"
      aria-describedby="inactivity-warning-description"
      disableEscapeKeyDown={false}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: {
            xs: '90%',
            sm: 450,
          },
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 3,
          p: 4,
          outline: 'none',
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertCircle size={32} color="#F59E0B" />
          </Box>
        </Box>

        {/* Title */}
        <Typography
          id="inactivity-warning-modal"
          variant="h5"
          component="h2"
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            mb: 2,
            color: '#1F2937',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Session Timeout Warning
        </Typography>

        {/* Description */}
        <Typography
          id="inactivity-warning-description"
          sx={{
            textAlign: 'center',
            mb: 3,
            color: '#6B7280',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          You've been inactive for a while. For your security, you will be
          automatically logged out in:
        </Typography>

        {/* Countdown */}
        <Box
          sx={{
            mb: 3,
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: '48px',
              fontWeight: 700,
              color: remainingTime <= 5 ? '#EF4444' : '#F59E0B',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1,
              mb: 1,
            }}
          >
            {remainingTime}
          </Typography>
          <Typography
            sx={{
              fontSize: '14px',
              color: '#6B7280',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {remainingTime === 1 ? 'second' : 'seconds'}
          </Typography>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 4 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#E5E7EB',
              '& .MuiLinearProgress-bar': {
                backgroundColor: remainingTime <= 5 ? '#EF4444' : '#F59E0B',
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Security Info */}
        <Box
          sx={{
            backgroundColor: '#F3F4F6',
            borderRadius: 2,
            p: 2,
            mb: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: '12px',
              color: '#4B5563',
              fontFamily: 'Inter, sans-serif',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>
              This is a security feature to protect your account from
              unauthorized access when you're away from your device.
            </span>
          </Typography>
        </Box>

        {/* Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Button
            fullWidth
            variant="contained"
            onClick={onStayActive}
            startIcon={<MousePointer size={18} />}
            sx={{
              backgroundColor: '#475569',
              '&:hover': {
                backgroundColor: '#334155',
              },
              textTransform: 'none',
              fontWeight: 600,
              py: 1.5,
              borderRadius: 2,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Stay Logged In
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={onLogout}
            startIcon={<LogOut size={18} />}
            sx={{
              borderColor: '#D1D5DB',
              color: '#6B7280',
              '&:hover': {
                backgroundColor: '#F9FAFB',
                borderColor: '#9CA3AF',
              },
              textTransform: 'none',
              fontWeight: 600,
              py: 1.5,
              borderRadius: 2,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Logout Now
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default InactivityWarningModal;

