import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  targets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transition",
      transitionName: String,
    },
  ],
  sources: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transition",
      transitionName: String,
    },
  ],
  initStatus: { type: Boolean, default: false },
  // orphan: { type: Boolean, default: true },
  // final: { type: Boolean, default: true },
});
const Status = mongoose.model("Status", statusSchema);
export default Status;
