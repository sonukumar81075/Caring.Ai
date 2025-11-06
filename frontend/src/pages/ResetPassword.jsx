import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress, Paper, InputAdornment, IconButton } from '@mui/material';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import authService from '../services/authService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          p: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            maxWidth: 480,
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <CheckCircle style={{ width: 40, height: 40, color: '#fff' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
              Password Reset Successful!
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#64748b', lineHeight: 1.7 }}>
              Your password has been successfully reset. You will be redirected to the login page in a moment.
            </Typography>
            <CircularProgress sx={{ color: '#BAA377' }} />
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 480,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <img 
              src="/logo/logo.svg" 
              alt="CaringAI Logo" 
              style={{ height: '64px', width: 'auto' }}
            />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
            Reset Your Password
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.7 }}>
            Enter your new password below to reset your account password.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            sx={{ mb: 3 }}
            InputProps={{
              sx: {
                borderRadius: 2,
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            sx={{ mb: 3 }}
            InputProps={{
              sx: {
                borderRadius: 2,
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 1 }}>
              Password Requirements:
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
              • At least 6 characters long
              <br />
              • Mix of letters, numbers, and symbols recommended
            </Typography>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #BAA377 0%, #A8956A 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #A8956A 0%, #9A8760 100%)',
              },
              borderRadius: '8px',
              padding: '14px',
              fontWeight: 600,
              fontSize: '16px',
              textTransform: 'none',
              mb: 2,
              boxShadow: '0 4px 12px rgba(186, 163, 119, 0.3)',
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#fff' }} />
            ) : (
              'Reset Password'
            )}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              component={Link}
              to="/login"
              sx={{
                color: '#BAA377',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#A8956A',
                },
              }}
            >
              Back to Login
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ResetPassword;

