import { SignUp } from "@clerk/nextjs";
import { Container, Paper } from '@mui/material';
import Navbar from '@/app/components/layout/Navbar';

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, display: 'flex', justifyContent: 'center' }}>
          <SignUp routing="hash" />
        </Paper>
      </Container>
    </>
  );
}