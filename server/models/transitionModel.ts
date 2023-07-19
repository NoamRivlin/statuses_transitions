import mongoose from "mongoose";

const transitionSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  source: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Status",
    statusName: String,
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Status",
    statusName: String,
  },
});
const Transition = mongoose.model("Transition", transitionSchema);
export default Transition;
