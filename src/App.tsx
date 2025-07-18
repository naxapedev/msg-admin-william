import { Suspense, lazy } from "react";
import { CssBaseline, CircularProgress, Box } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

const Broadcast = lazy(() => import("./pages/BroadCast"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

export default function App() {
  return (
    <Router>
      <CssBaseline />
      <Navbar />
      <Suspense
        fallback={
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        }
      >
        <Routes>
          <Route path="/" element={<Broadcast />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
