import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
  initStatus: { name: String },
  statuses: [
    {
      statusId: mongoose.Schema.Types.ObjectId,
      name: { type: String, unique: true },
      target: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Transition",
          transitionName: String,
        },
      ],
      source: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Transition",
          transitionName: String,
        },
      ],
      orphan: { type: Boolean, default: true },
      final: { type: Boolean, default: true },
    },
  ],
});
const Status = mongoose.model("Status", statusSchema);
export default Status;
