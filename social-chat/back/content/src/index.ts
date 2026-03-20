import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/chat/ping", (_req, res) => {
  res.json({ ok: true, service: "social-chat" });
});

const port = Number(process.env.PORT) || 8890;
app.listen(port, () => {
  console.log(`Social chat service running on port ${port}`);
});
