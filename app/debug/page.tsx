'use client';

import ApiDebugger from '@/app/components/debug/ApiDebugger';
import Navbar from '@/app/components/layout/Navbar';
import { Box } from '@mui/material';

export default function DebugPage() {
  return (
    <Box>
      <Navbar />
      <ApiDebugger />
    </Box>
  );
}