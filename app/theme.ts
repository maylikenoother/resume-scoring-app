/** Clear Review — confident cobalt hierarchy, editorial surfaces, and calm, accessible product feedback. */
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#254FC7', light: '#E8EEFF', dark: '#183493', contrastText: '#FFFFFF' },
    secondary: { main: '#0E8073', light: '#DFF4F0', dark: '#0A6258' },
    background: { default: '#F6F8FC', paper: '#FFFFFF' },
    text: { primary: '#13203A', secondary: '#5C6A7E' },
    divider: '#E0E6F0',
    error: { main: '#C33434' },
    success: { main: '#12805C' },
  },
  shape: { borderRadius: 18 },
  typography: {
    fontFamily: ['Manrope', 'Aptos', 'Segoe UI', 'Arial', 'sans-serif'].join(','),
    h1: { fontWeight: 750, letterSpacing: '-0.052em', lineHeight: 1.02 },
    h2: { fontWeight: 720, letterSpacing: '-0.038em' },
    h3: { fontWeight: 700, letterSpacing: '-0.025em' },
    button: { fontWeight: 750, letterSpacing: '0' },
  },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: '#F6F8FC', color: '#13203A' }, '*:focus-visible': { outline: '3px solid rgba(37, 79, 199, 0.28)', outlineOffset: '3px' } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 12, minHeight: 44, paddingInline: 18, textTransform: 'none', boxShadow: 'none', transition: 'transform 140ms ease, box-shadow 180ms ease, background-color 180ms ease' }, contained: { '&:hover': { boxShadow: '0 11px 26px rgba(37, 79, 199, 0.22)', transform: 'translateY(-1px)' }, '&:active': { transform: 'scale(0.98)' } } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 18 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 18, boxShadow: '0 14px 34px rgba(26, 47, 92, 0.07)' } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 9, fontWeight: 750 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12, background: '#FFFFFF', '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#A6B9F5' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#254FC7', borderWidth: 2 } } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

export default theme;
