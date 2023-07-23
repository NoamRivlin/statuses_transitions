import mongoose, { Document } from "mongoose";

export interface ITransition extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  sourceId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
}

const transitionSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Status",
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Status",
    required: true,
  },
});
const Transition = mongoose.model("Transition", transitionSchema);
export default Transition;
