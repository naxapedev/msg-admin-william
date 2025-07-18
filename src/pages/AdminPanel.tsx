import { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Typography,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";

const adminId = "68767ca8b4d9fa5fe49dae23"; // replace with actual
const broadcastLabels = {
  driver: "📢 Broadcast to Drivers",
  manager: "📢 Broadcast to Managers",
  others: "📢 Broadcast to Others",
};

export default function AdminPanel() {
  const [filter, setFilter] = useState("driver");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null); // user object or null
  const [selectedRole, setSelectedRole] = useState("driver");
  const chatKey = selectedUser ? selectedUser._id : `broadcast:${selectedRole}`;

  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [status, setStatus] = useState(null);

  // Load either broadcast or conversation
  useEffect(() => {
    const load = async () => {
      if (selectedUser) {
        // 1-on-1 conversation

        const res = await axios.get(
          `http://localhost:4000/api/v1/messages/con?userA=${adminId}&userB=${selectedUser._id}`
        );

        const data = res.data.data || [];
        setMessages((prev) => ({
          ...prev,
          [chatKey]: data.map((m) => ({
            sender: m.sender.id === adminId ? "Admin" : m.sender.role,
            text: m.text,
            time: new Date(m.createdAt).toLocaleTimeString(),
          })),
        }));
      } else {
        // broadcast history
        const res = await axios.get(
          `http://localhost:4000/api/v1/messages/broad?role=${selectedRole}`
        );

        const data = res.data.data || [];
        setMessages((prev) => ({
          ...prev,
          [chatKey]: data.reverse().map((m) => ({
            sender: m.createdBy.role === "admin" ? "Admin" : m.createdBy.role,
            text: m.text,
            time: new Date(m.createdAt).toLocaleTimeString(),
          })),
        }));
      }
    };
    load().catch(console.error);
  }, [chatKey, selectedUser, selectedRole]);

  // Search users on input
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers([]);
      return;
    }
    axios
      .get(`http://localhost:4000/api/v1/messages/search`, {
        params: { role: filter, name: searchTerm },
      })
      .then((res) => {
        setFilteredUsers(res.data.users || []);
        console.log(filteredUsers);
        
      })
      .catch(console.error);
  }, [searchTerm, filter]);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      if (selectedUser) {
        // Send one-on-one

        await axios.post(`http://localhost:4000/api/v1/messages/send`, {
          senderId: adminId,
          senderRole: "admin",
          receiverRole: selectedRole,
          receiverId: selectedUser._id,
          type: "text",
          text: input.trim(),
        });
      } else {
        // Broadcast message
        await axios.post(`http://localhost:4000/api/v1/messages/broadcast`, {
          role: selectedRole,
          type: "text",
          text: input.trim(),
        });
      }
      const newMsg = {
        sender: "Admin",
        text: input,
        time: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => ({
        ...prev,
        [chatKey]: [...(prev[chatKey] || []), newMsg],
      }));
      setInput("");
      setStatus("sent");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <Box display="flex" height="100vh">
      <Drawer variant="permanent" sx={{ width: 300 }}>
        <Box p={2}>
          {/* Role filter */}
          <Box mb={2} display="flex" justifyContent="space-between">
            {["driver", "manager", "others"].map((r) => (
              <Button
                key={r}
                variant={filter === r ? "contained" : "outlined"}
                onClick={() => {
                  setFilter(r);
                  setSelectedUser(null);
                  setSelectedRole(r);
                  setSearchTerm("");
                }}
              >
                {r}
              </Button>
            ))}
          </Box>
          {/* Search input */}
          <TextField
            fullWidth
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {/* List */}
          <List>
            {searchTerm.trim() ? (
              filteredUsers.map((u) => (
                <ListItem
                  key={u._id}
                  button
                  selected={selectedUser?._id === u._id}
                  onClick={() => {
                    setSelectedUser(u);
                    setSelectedRole(u.role);
                  }}
                >
                  <img
                    src={u.avatar_url}
                    alt="a"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      marginRight: 10,
                    }}
                  />
                  <ListItemText primary={u.name} />
                </ListItem>
              ))
            ) : (
              <ListItem
                button
                selected={!selectedUser && chatKey.startsWith("broadcast")}
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedRole(filter);
                }}
              >
                <ListItemText primary={broadcastLabels[filter]} />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Chat Window */}
      <Box flexGrow={1} p={2}>
        <Typography variant="h6" gutterBottom>
          {selectedUser ? selectedUser.name : broadcastLabels[selectedRole]}
        </Typography>
        <Box flex={1} border={1} borderRadius={1} p={2} overflow="auto">
          {(messages[chatKey] || []).map((m, i) => (
            <Box
              key={i}
              display="flex"
              justifyContent={m.sender === "Admin" ? "flex-end" : "flex-start"}
              mb={1}
            >
              <Box
                bgcolor={m.sender === "Admin" ? "#1976d2" : "#ccc"}
                color="#fff"
                p={1}
                borderRadius={1}
                maxWidth="60%"
              >
                <Typography variant="body2">{m.text}</Typography>
                <Typography variant="caption" align="right" display="block">
                  {m.time}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box mt={2} display="flex">
          <TextField
            flex={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button variant="contained" onClick={handleSend} sx={{ ml: 1 }}>
            Send
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={Boolean(status)}
        autoHideDuration={3000}
        onClose={() => setStatus(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={status === "sent" ? "success" : "error"}>
          {status === "sent" ? "Sent!" : "Failed"}
        </Alert>
      </Snackbar>
    </Box>
  );
}
