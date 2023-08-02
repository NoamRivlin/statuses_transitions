import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import statusRoutes from "./routes/statusRoutes";
import transitionRoutes from "./routes/transitionsRoutes";
import cors from "cors";

dotenv.config({ path: "./.env" });
const PORT = process.env.PORT || 4000;

const connection = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB connected: ${db.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
connection();

const app = express();
// cors is needed to allow the frontend to make requests to the backend
app.use(cors());
//  to parse json in the body of the request (json data)
app.use(express.json());
// to parse url encoded data in the body of the request (form data)
app.use(express.urlencoded({ extended: true }));

app.use("/api/status", statusRoutes);
app.use("/api/transition", transitionRoutes);

// listen for requests
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
