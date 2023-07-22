import mongoose, { Document } from "mongoose";

export interface IStatus extends Document {
  name: string;
  _id: mongoose.Types.ObjectId;
  // transitions: Array<{
  //   name: string;
  //   transitionId: mongoose.Types.ObjectId;
  //   targetId: mongoose.Types.ObjectId;
  // }>;
  transitions: Array<mongoose.Types.ObjectId>;
  initStatus: boolean;
  orphan: boolean;
}

const statusSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  // transitions: [
  //   {
  //     name: { type: String, required: true }, // Add the 'name' property
  //     transitionId: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "Transition",
  //       required: true,
  //     },
  //     targetId: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "Status",
  //       required: true,
  //     },
  //   },
  // ],
  transitions: Array<mongoose.Schema.Types.ObjectId>,
  initStatus: { type: Boolean, default: false },
  orphan: { type: Boolean, default: true },
});

const Status = mongoose.model<IStatus>("Status", statusSchema);
export default Status;

// import mongoose, { Document } from "mongoose";

// export interface IStatus extends Document {
//   name: string;
//   transitions: Array<{
//     // transitionId: mongoose.Schema.Types.ObjectId;
//     transitionId: mongoose.Types.ObjectId;
//   }>;
//   initStatus: boolean;
//   orphan: boolean;
// }

// const statusSchema = new mongoose.Schema({
//   name: { type: String, unique: true, required: true },
//   transitions: [
//     {
//       transitionId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Transition",
//         required: true,
//       },

//       // _id keeps being created even though it is not in the schema
//     },
//   ],
//   initStatus: { type: Boolean, default: false },
//   orphan: { type: Boolean, default: true },
//   // final: { type: Boolean, default: true },
// });
// const Status = mongoose.model("Status", statusSchema);
// export default Status;
