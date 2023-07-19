import { Request, Response } from "express";
import Status from "../models/statusModel";
import Transition from "../models/transitionModel";

// method: POST
// path: /api/statuses
export const addStatus = async (req: Request, res: Response) => {
  const { name } = req.body;
  const numberOfStatuses = await Status.count({});

  if (numberOfStatuses === 0) {
    const status = await Status.create({
      name,
      init: true,
    });
    res.status(201).json({ status });
  }
  if (numberOfStatuses > 0) {
    if (await Status.findOne({ name })) {
      res.status(400).json({ message: "Status already exists" });
      return;
    }
    const newStatus = await Status.create({ name });

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
    const allStatuses = await Status.find({});
    res.status(200).json(allStatuses);
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
    // Find the status to be deleted
    const statusToDelete = await Status.findOne({ name });
    if (!statusToDelete) {
      res.status(400).json({ message: "Status does not exist" });
      return;
    }

    if (statusToDelete.initStatus) {
      // Find the first status that is not the one to be deleted
      const newInitStatus = await Status.findOne({ name: { $ne: name } });

      if (newInitStatus) {
        // Set the new status as the initStatus
        newInitStatus.initStatus = true;
        await newInitStatus.save();
      }
    }
    await statusToDelete.deleteOne();

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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// method: DELETE
// path: /api/statuses/reset
export const reset = async (req: Request, res: Response) => {
  try {
    await Status.deleteMany({});
    await Transition.deleteMany({});
    res.status(200).json({ message: "Reset successful" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
