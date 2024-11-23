import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
app.use(express.json());
const port = 3500;

const corsOptions = {
  origin: ["https://my-private.vercel.app", "http://localhost:5173"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// API lấy danh sách từ bảng `privates`
app.get("/api/privates", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("privates")
      .select("*")
      .order('id', { ascending: true });

    if (error) {
      console.error("Error fetching data:", error);
      return res.status(500).json({ error: "Failed to fetch data" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch('/api/update/:id', async (req, res) => {
  const { id } = req.params; // Lấy id từ URLs
  const { status, time } = req.body; // Lấy dữ liệu cập nhật từ body
  const converIdToNumber = Number.parseInt(id); // Chuyển id sang kiểu số

  // Chuyển timeFromBody thành kiểu timestamp hợp lệ
  const validTime = time ? new Date(time).toISOString() : null;

  try {
    // Cập nhật bản ghi trong bảng `privates` bằng Supabase
    const { data, error } = await supabase
      .from("privates")
      .update({ time: validTime, status: status })
      .eq("id", converIdToNumber)
      .select();
    if (error) {
      console.error("Error updating data:", error);
      return res.status(500).json({ error: "Failed to update data" });
    }
    return res.status(200).json(data[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});

app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});

export default app;
