import { Request, Response } from "express";
import Status, { IStatus } from "../models/statusModel";
import Transition, { ITransition } from "../models/transitionModel";
import mongoose from "mongoose";

// method: POST
// path: /api/status
export const addStatus = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const numberOfStatuses = await Status.count({}); // returns a number
    if (numberOfStatuses === 0) {
      // if there are no statuses in the db, then the first one is the initStatus
      const initStatus = await Status.create({
        name,
        initStatus: true,
        orphan: false,
      });
      res.status(201).json({ initStatus });
      return;
    }
    if (await Status.findOne({ name })) {
      res.status(400).json({ message: "Status already exists" });
      return;
    }
    const newStatus = await Status.create({ name });
    res.status(201).json(newStatus);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// method: GET
// path: /api/status
export const getStatuses = async (req: Request, res: Response) => {
  try {
    const allStatuses = await Status.find({});

    res.status(200).json(allStatuses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// method: DELETE
// path: /api/status
export const deleteStatus = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const statusToDelete = await Status.findOne({ _id: id });

    if (!statusToDelete) {
      res.status(400).json({ message: "Status does not exist" });
      return;
    }
    // check if the status is the initStatus
    if (statusToDelete.initStatus) {
      // Find the first status that is not the one to be deleted
      const newInitStatus = await Status.findOne({ _id: { $ne: id } });

      if (newInitStatus) {
        // Set the new status as the initStatus
        newInitStatus.initStatus = true;
        await newInitStatus.save();
      }
    }
    await statusToDelete.deleteOne();

    // remove the transitions that have the status as a source or target
    await Transition.deleteMany({
      $or: [{ sourceId: id }, { targetId: id }],
    });

    const updatedStatuses = await Status.find({});
    res.status(200).json(updatedStatuses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// method: PATCH
// path: /api/status
export const editInitStatus = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    type IStatusPopulated = Omit<IStatus, "transitions"> & {
      transitions: Array<{ targetId: mongoose.Types.ObjectId }>;
    };

    const statuses: IStatusPopulated[] = await Status.find({}).populate({
      path: "transitions",
      model: "Transition",
      select: "targetId", // Specify the property you want to take from the Transition model
    });

    const oldInit = statuses.find((status) => status.initStatus);
    const newInit = statuses.find(
      (status) => status._id.toString() === id.toString()
    );

    if (!oldInit || !newInit) {
      res.status(400).json({ message: "Status does not exist" });
      return;
    }
    if (oldInit._id.toString() === newInit._id.toString()) {
      res.status(400).json({ message: "Status is already the initStatus" });
      return;
    }

    // update the initStatus property of the statuses in a single query
    await Status.bulkWrite([
      {
        updateOne: {
          filter: { _id: oldInit._id },
          update: { $set: { initStatus: false } },
        },
      },
      {
        updateOne: {
          filter: { _id: newInit._id },
          update: { $set: { initStatus: true, orphan: false } },
        },
      },
    ]);

    const nodeSearched: { [key: string]: boolean } = {
      [newInit._id.toString()]: true,
    };

    interface INode {
      status: IStatusPopulated;
      checked: boolean;
    }

    newInit.orphan = false;
    newInit.initStatus = true;
    oldInit.initStatus = false;

    const queue: INode[] = [
      {
        // check is whether we've checked the node's neighboors
        status: newInit,
        checked: false,
      },
    ];

    // we check if there are any nodes left to check
    while (queue.some((item) => !item.checked)) {
      const currentNode = queue.find((item) => !item.checked);
      if (!currentNode) break;
      if (currentNode.status.transitions?.length) {
        for (const transition of currentNode.status.transitions) {
          // if the targetId is not in the nodeSearched object
          if (!nodeSearched[transition.targetId.toString()]) {
            // add it to the obj and set it to true
            nodeSearched[transition.targetId.toString()] = true;
            // find the status that the newInit is transitioning to
            const status = statuses.find(
              (status) =>
                status._id.toString() === transition.targetId.toString()
            );
            // if status is found then set orphan to false and add it to the queue
            // so we can check its neighboors
            if (status) {
              status.orphan = false;
              await status.save();
              queue.push({
                status,
                checked: false,
              });
            }
          }
        }
      }
      currentNode.checked = true;
    }
    // TODO: do all of this in a single loop
    const orphans = statuses.filter(
      (status) => !nodeSearched[status._id.toString()]
    );

    for (const status of orphans) {
      status.orphan = true;
      await status.save();
    }
    const updatedStatuses = await Status.find({});
    res.status(200).json(updatedStatuses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// method: DELETE
// path: /api/status/reset
export const reset = async (req: Request, res: Response) => {
  try {
    await Status.deleteMany({});
    await Transition.deleteMany({});
    res.status(200).json({ message: "Reset successful" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// method: GET
// path: /api/status/reset
export const test = async (req: Request, res: Response) => {
  try {
    // create statuses array with the initStatus and the other statuses with empty transitions, names are start,review, rejected, deploy, cancel
    const statuses: IStatus[] = await Status.insertMany([
      { name: "start", initStatus: true, orphan: false, transitions: [] },
      { name: "review", initStatus: false, orphan: true, transitions: [] },
      { name: "rejected", initStatus: false, orphan: true, transitions: [] },
      { name: "deploy", initStatus: false, orphan: true, transitions: [] },
      { name: "cancel", initStatus: false, orphan: true, transitions: [] },
    ]);

    if (statuses.length === 0) {
      res.status(400).json({ message: "Statuses array is empty" });
      return;
    }

    const transitions: ITransition[] = await Transition.insertMany([
      {
        name: "startReview",
        sourceId: statuses.find((status) => status.name === "start")!._id,
        targetId: statuses.find((status) => status.name === "review")!._id,
      },
      {
        name: "reviewDeploy",
        sourceId: statuses.find((status) => status.name === "review")!._id,
        targetId: statuses.find((status) => status.name === "deploy")!._id,
      },
      {
        name: "cancelRejected",
        sourceId: statuses.find((status) => status.name === "cancel")!._id,
        targetId: statuses.find((status) => status.name === "rejected")!._id,
      },
      {
        name: "rejectedDeploy",
        sourceId: statuses.find((status) => status.name === "rejected")!._id,
        targetId: statuses.find((status) => status.name === "deploy")!._id,
      },
    ]);

    const startStatus = statuses.find((status) => status.name === "start");
    const startReviewTransition = transitions.find(
      (transition) => transition.name === "startReview"
    );

    if (startStatus && startReviewTransition) {
      startStatus.transitions.push(startReviewTransition._id);
    }

    const reviewStatus = statuses.find((status) => status.name === "review");
    const reviewDeployTransition = transitions.find(
      (transition) => transition.name === "reviewDeploy"
    );
    if (reviewStatus && reviewDeployTransition) {
      reviewStatus.transitions.push(reviewDeployTransition._id);
    }
    const cancelStatus = statuses.find((status) => status.name === "cancel");
    const cancelRejectedTransition = transitions.find(
      (transition) => transition.name === "cancelRejected"
    );
    if (cancelStatus && cancelRejectedTransition) {
      cancelStatus.transitions.push(cancelRejectedTransition._id);
    }
    const rejectedStatus = statuses.find(
      (status) => status.name === "rejected"
    );
    const rejectedDeployTransition = transitions.find(
      (transition) => transition.name === "rejectedDeploy"
    );
    if (rejectedStatus && rejectedDeployTransition) {
      rejectedStatus.transitions.push(rejectedDeployTransition._id);
    }

    statuses.find((status) => status.name === "review")!.orphan = false;
    statuses.find((status) => status.name === "deploy")!.orphan = false;
    for (const status of statuses) {
      await status.save();
    }

    res.status(201).json({ statuses, transitions });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
