import axios from "axios";

const BASE_URL = "http://localhost:4000/api/v1/messages";

export const sendBroadcast = async (text: string) =>
  axios.post(`${BASE_URL}/send`, {
    senderId: "68767ca8b4d9fa5fe49dae23", // will come from Redux/store later
    senderRole: "admin",
    isBroadcast: true,
    type: "text",
    text,
  });

export const getMessages = async () =>
  axios.get(BASE_URL, {
    params: {
      userId: "68767ca8b4d9fa5fe49dae23",
      role: "admin",
      includeBroadcast: "true",
      includePrivate: "false",
    },
  });
