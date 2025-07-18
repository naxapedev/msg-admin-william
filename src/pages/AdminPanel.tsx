// WhatsApp-style Admin Chat Panel (Frontend Only)
// Responsive Structure: LeftSidebar (filters + search + users/broadcasts), RightChat (chat window)

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Divider,
  Paper,
  Button,
  useMediaQuery,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";

const dummyUsers = {
  driver: ["Driver A", "Driver B", "Driver C"],
  manager: ["Manager X", "Manager Y"],
  others: ["Other 1", "Other 2"],
};

const broadcastLabels = {
  driver: "📢 Broadcast to Drivers",
  manager: "📢 Broadcast to Managers",
  others: "📢 Broadcast to Others",
};

export default function AdminPanel() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [filter, setFilter] = useState("driver");
  const [selectedChat, setSelectedChat] = useState(broadcastLabels["driver"]);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState(null);

  const filteredUserList = searchTerm.trim()
    ? dummyUsers[filter].filter((user) =>
        user.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const displayList = searchTerm.trim()
    ? filteredUserList
    : [broadcastLabels[filter]];

  const currentChatMessages = messages[selectedChat] || [];

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = {
      sender: "Admin",
      text: input,
      time: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMessage],
    }));
    setInput("");
    setStatus("sent");
  };

  const handleClose = () => setStatus(null);

  return (
    <Box
      display="flex"
      flexDirection={isMobile ? "column" : "row"}
      height="100vh"
    >
      {/* LEFT SIDEBAR */}
      <Paper
        sx={{
          width: isMobile ? "100%" : 300,
          p: 2,
          borderRight: isMobile ? "none" : "1px solid #ccc",
          borderBottom: isMobile ? "1px solid #ccc" : "none",
          overflowY: "auto",
        }}
        square
      >
        <Typography variant="h6" mb={2}>
          Filters
        </Typography>
        <RadioGroup
          row={!isMobile}
          value={filter}
          onChange={(e) => {
            const newFilter = e.target.value;
            setFilter(newFilter);
            setSelectedChat(broadcastLabels[newFilter]);
            setSearchTerm("");
          }}
        >
          <FormControlLabel value="driver" control={<Radio />} label="Drivers" />
          <FormControlLabel value="manager" control={<Radio />} label="Managers" />
          <FormControlLabel value="others" control={<Radio />} label="Others" />
        </RadioGroup>

        <TextField
          placeholder="Search user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" mb={1}>
          Chats
        </Typography>
        <List>
          {displayList.map((name) => (
            <ListItem
              button
              key={name}
              selected={selectedChat === name}
              onClick={() => setSelectedChat(name)}
            >
              <ListItemText primary={name} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* RIGHT CHAT WINDOW */}
      <Box flex={1} display="flex" flexDirection="column" p={2}>
        <Typography variant="h6" gutterBottom>
          Chat with: {selectedChat}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box
          flex={1}
          sx={{ overflowY: "auto", mb: 2, pr: 1 }}
          display="flex"
          flexDirection="column"
          gap={1.5}
        >
          {currentChatMessages.length === 0 ? (
            <Typography color="text.secondary">
              No messages yet.
            </Typography>
          ) : (
            currentChatMessages.map((msg, i) => (
              <Box
                key={i}
                alignSelf={msg.sender === "Admin" ? "flex-end" : "flex-start"}
                bgcolor={msg.sender === "Admin" ? "#DCF8C6" : "#F1F0F0"}
                px={2}
                py={1}
                borderRadius={2}
                maxWidth="80%"
              >
                <Typography variant="body2">{msg.text}</Typography>
                <Typography variant="caption" display="block" align="right">
                  {msg.time}
                </Typography>
              </Box>
            ))
          )}
        </Box>

        <Box display="flex" gap={1} flexDirection={isMobile ? "column" : "row"}>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            variant="outlined"
          />
          <Button variant="contained" onClick={handleSend} fullWidth={isMobile}>
            Send
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={status === "sent"}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={handleClose}>
          Broadcast sent!
        </Alert>
      </Snackbar>
    </Box>
  );
}
