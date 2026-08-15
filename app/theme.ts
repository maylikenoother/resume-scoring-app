/** Clear Review — polished blue product interface, calm hierarchy, practical feedback. */
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#2454D7', light: '#E8EEFF', dark: '#163A9A', contrastText: '#FFFFFF' },
    secondary: { main: '#0F766E', light: '#DDF5F1', dark: '#115E59' },
    background: { default: '#F7F9FC', paper: '#FFFFFF' },
    text: { primary: '#172033', secondary: '#5F6B7A' },
    divider: '#E3E8F2',
    error: { main: '#C33434' },
    success: { main: '#12805C' },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: ['Manrope', 'Aptos', 'Segoe UI', 'Arial', 'sans-serif'].join(','),
    h1: { fontWeight: 750, letterSpacing: '-0.045em', lineHeight: 1.05 },
    h2: { fontWeight: 720, letterSpacing: '-0.035em' },
    h3: { fontWeight: 700, letterSpacing: '-0.025em' },
    button: { fontWeight: 750, letterSpacing: '0' },
  },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: '#F7F9FC', color: '#172033' }, '*:focus-visible': { outline: '3px solid rgba(36, 84, 215, 0.28)', outlineOffset: '3px' } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 12, minHeight: 44, paddingInline: 18, textTransform: 'none', boxShadow: 'none', transition: 'transform 140ms ease, box-shadow 180ms ease, background-color 180ms ease' }, contained: { '&:hover': { boxShadow: '0 10px 24px rgba(36, 84, 215, 0.2)', transform: 'translateY(-1px)' }, '&:active': { transform: 'scale(0.98)' } } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 20 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12, background: '#FFFFFF', '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9CB6FF' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2454D7', borderWidth: 2 } } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

export default theme;
