import { Request, Response } from "express";
import Status from "../models/statusModel";
import Transition from "../models/transitionModel";

// method: POST
// path: /api/statuses
export const addStatus = async (req: Request, res: Response) => {
  const { name } = req.body;
  const allStatuses = await Status.find({}, "statuses");
  if (!allStatuses.length) {
    const status = await Status.create({
      initStatus: { name },
      statuses: [{ name, orphan: false }],
    });
    res.status(201).json({ status });
  }
  if (allStatuses.length) {
    const statusNameExists = await Status.findOne({ "statuses.name": name });
    if (statusNameExists) {
      res.status(400).json({ message: "Status already exists" });
      return;
    }
    const newStatus = await Status.findOneAndUpdate(
      {},
      { $push: { statuses: { name } } },
      { new: true }
    );
    res.status(201).json(newStatus);
  }
  try {
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// method: GET
// path: /api/statuses
export const getStatuses = async (req: Request, res: Response) => {
  try {
    const statuses = await Status.find({}, "statuses");
    res.status(200).json(statuses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// method: DELETE
// path: /api/statuses
export const deleteStatus = async (req: Request, res: Response) => {
  const { name } = req.body;
  // check if the status is the initStatus
  try {
    const statusToDelete = await Status.findOneAndUpdate(
      {},
      { $pull: { statuses: { name } } },
      { new: true }
    );

    // remove the status from the statuses array

    // remove the transitions that have the status as a source or target
    await Transition.deleteMany({
      $or: [{ "source.statusName": name }, { "target.statusName": name }],
    });
    res.status(200).json(statusToDelete);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// method: PUT
// path: /api/statuses
export const editInitStatus = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    // update the initStatus field of the status document to the new status name
    // and also make it's orphan and final fields false
    const updatedStatus = await Status.findOneAndUpdate(
      {},
      { initStatus: { name }, statuses: { orphan: false, final: false } },
      { new: true }
    );
    /* const updatedStatus = await Status.findOneAndUpdate(
        {},
        { initStatus: { name }  },
        { new: true }
        );
        // if previous status is an  
        if (!updatedStatus) {
        res.status(404).json({ message: "Status not found" });
        return;
        }
        res.status(200).json(updatedStatus); */
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// method: DELETE
// path: /api/statuses/reset
export const reset = async (req: Request, res: Response) => {
  try {
    // there is only one status
    await Status.deleteOne({});
    await Transition.deleteMany({});
    res.status(200).json({ message: "Reset successful" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
