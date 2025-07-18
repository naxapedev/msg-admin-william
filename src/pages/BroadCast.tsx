import { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Snackbar,
  TextField,
  Typography,
  Alert,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { sendBroadcast, getMessages } from "../api/api"; // Make sure getMessages exists

const Broadcast = () => {
  const [message, setMessage] = useState("");
  const [status, setStatus] =
    useState<null | "sending" | "sent" | "error">(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    try {
      setStatus("sending");
      await sendBroadcast(message.trim());
      setStatus("sent");
      setMessage("");
      fetchMessages(); // Refresh list after sending
    } catch {
      setStatus("error");
    }
  };

  const handleClose = () => setStatus(null);

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const res = await getMessages();
      setMessages(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <Box
      maxWidth={600}
      mx="auto"
      mt={8}
      px={2}
      display="flex"
      flexDirection="column"
      gap={4}
    >
      <Typography variant="h4" fontWeight={600} textAlign="center">
        Broadcast to All Drivers
      </Typography>

      <TextField
        label="Announcement"
        multiline
        minRows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        fullWidth
      />

      <Button
        variant="contained"
        onClick={handleSend}
        disabled={!message.trim() || status === "sending"}
        startIcon={status === "sending" ? <CircularProgress size={20} /> : null}
      >
        {status === "sending" ? "Sending…" : "Send Broadcast"}
      </Button>

      <Snackbar
        open={status === "sent" || status === "error"}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {status === "sent" ? (
          <Alert severity="success" onClose={handleClose}>
            Broadcast sent!
          </Alert>
        ) : (
          status === "error" && (
            <Alert severity="error" onClose={handleClose}>
              Failed to send
            </Alert>
          )
        )}
      </Snackbar>

      <Divider />

      <Typography variant="h6">📢 Broadcast History</Typography>
      {loadingMessages ? (
        <CircularProgress />
      ) : messages.length === 0 ? (
        <Typography color="text.secondary">No broadcasts found.</Typography>
      ) : (
        messages.map((msg) => (
          <Card key={msg._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography>{msg.text}</Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                Sent at: {new Date(msg.createdAt).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}

export default Broadcast