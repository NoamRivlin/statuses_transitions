import mongoose, { Document } from "mongoose";

// when used in transition controller it breaks the code
export interface ITransition extends Document {
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
