import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const STATE_FILE_PATH = path.join(process.cwd(), "state.json");

app.use(express.json());

// API: Check health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: Call Pro-Talk AI service
app.post("/api/ai/generate", async (req, res) => {
  const { prompt, systemPrompt, chatId, userId } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // Generate or use user ID to construct ii_rr<userId> model name
  let finalModel = "ii_rr";
  if (userId && /^\d+$/.test(String(userId))) {
    finalModel = `ii_rr${userId}`;
  } else {
    // Generate a random 8-digit numeric ID as fallback
    const randomId = Math.floor(10000000 + Math.random() * 90000000);
    finalModel = `ii_rr${randomId}`;
  }

  const bot_token = "69415_ex7HN6J3qdiME3jBVbtCyBo4s8me3tvq";
  const url = "https://ai.pro-talk.ru/v1/chat/completions";

  try {
    // We send /restart sequence as instructed to make sure the state is fresh, 
    // followed by the requested system prompt and actual prompt.
    const messages = [
      { role: "user", content: "/restart" },
      { role: "assistant", content: "Диалог перезапущен." }
    ];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    } else {
      messages.push({ role: "system", content: "Ты — ИИ Рапорт, умный ассистент по заполнению отчетов и анализу эффективности сотрудников. Отвечай кратко, профессионально и по делу." });
    }

    messages.push({ role: "user", content: prompt });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bot_token}`
      },
      body: JSON.stringify({
        model: finalModel,
        messages: messages,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "";
    
    return res.json({ text: reply, raw: data });
  } catch (error: any) {
    console.error("AI Generation error:", error);
    return res.status(500).json({ 
      error: "Ошибка подключения к ИИ-сервису.", 
      message: error.message 
    });
  }
});

// API: Telegram Bot Chat connection check
app.post("/api/telegram/test-chat", async (req, res) => {
  const { chatId } = req.body;
  const token = "8598472380:AAEfgSiqsOJx4mA3Jk5DKYW8AUFgLGV4Sc8";

  if (!chatId) {
    return res.status(400).json({ success: false, error: "Пожалуйста, введите ID чата." });
  }

  try {
    const textMessage = "🤖 **Проверка интеграции ИИ Рапорт**\n\nБот успешно привязан к вашей системе и готов публиковать рапорты сотрудников! Спасибо за успешное добавление!";
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: textMessage,
        parse_mode: "Markdown"
      })
    });

    const data = await response.json();

    if (data.ok) {
      return res.json({ 
        success: true, 
        message: "Бот успешно добавлен! В ваш чат отправлено подтверждающее сообщение." 
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        error: `Ошибка Telegram API: ${data.description}. Проверьте, добавлен ли бот @ii_rr_bot в чат и правильность введённого ID.` 
      });
    }
  } catch (error: any) {
    console.error("Telegram test error:", error);
    return res.status(500).json({ 
      success: false, 
      error: `Не удалось связаться с Telegram API: ${error.message}` 
    });
  }
});

// API: State persistence (saving and loading user data)
app.get("/api/state/load", (req, res) => {
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const rawData = fs.readFileSync(STATE_FILE_PATH, "utf-8");
      return res.json(JSON.parse(rawData));
    }
    return res.json({ status: "not_found", message: "No stored state found" });
  } catch (error: any) {
    console.error("Error reading state.json:", error);
    return res.status(500).json({ error: "Failed to read data state" });
  }
});

app.post("/api/state/save", (req, res) => {
  try {
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(req.body, null, 2), "utf-8");
    return res.json({ success: true });
  } catch (error: any) {
    console.error("Error writing state.json:", error);
    return res.status(500).json({ error: "Failed to save data state" });
  }
});

// Integration with Vite
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

initServer();
