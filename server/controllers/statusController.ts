import { Request, Response } from "express";
import Status, { IStatus } from "../models/statusModel";
import Transition, { ITransition } from "../models/transitionModel";
import mongoose from "mongoose";
import { log } from "console";

// method: POST
// path: /api/statuses
export const addStatus = async (req: Request, res: Response) => {
  const { name } = req.body;
  const numberOfStatuses = await Status.count({});
  try {
    if (numberOfStatuses === 0) {
      const status = await Status.create({
        name,
        initStatus: true,
        orphan: false,
      });
      res.status(201).json({ status });
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

// method: PATCH
// path: /api/statuses
export const editInitStatus = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    // interface IStatusPopulated extends IStatus {
    //   transitions: [{ targetId: mongoose.Types.ObjectId }];
    // }
    type IStatusPopulated = Omit<IStatus, "transitions"> & {
      transitions: Array<{ targetId: mongoose.Types.ObjectId }>;
    };

    /* interface User {
    id: mongoose.Types.ObjectId;
    name: string;
    pets: Array<mongoose.Types.ObjectId>;
}

  interface Pet {
    name: string;
}

  type UserPopulated = Omit<User, 'pets'> & {
    pets: Array<Pet>;
};


 */
    const statuses: IStatusPopulated[] = await Status.find({}).populate({
      path: "transitions",
      model: "Transition",
      select: "targetId", // Specify the property you want to take from the Transition model
      // populate: { path: "targetId", model: "Status" },
    });

    const oldInit = statuses.find((status) => status.initStatus);
    const newInit = statuses.find(
      (status) => status._id.toString() === id.toString()
    );
    console.log("oldInit", oldInit, "newInit", newInit);

    if (!oldInit || !newInit) {
      res.status(400).json({ message: "Status does not exist" });
      return;
    }
    if (oldInit._id.toString() === newInit._id.toString()) {
      res.status(400).json({ message: "Status is already the initStatus" });
      return;
    }

    await Status.updateOne(
      { _id: oldInit._id },
      // does the old init becomes an orphan? depends on transitions
      { $set: { initStatus: false } }
    );
    await Status.updateOne(
      { _id: newInit._id },
      { $set: { initStatus: true, orphan: false } }
    );

    // await Status.bulkWrite([
    //   {
    //     updateOne: {
    //       filter: { _id: oldInit._id },
    //       update: { $set: { initStatus: false } },
    //     },
    //   },
    //   {
    //     updateOne: {
    //       filter: { _id: newInit._id },
    //       update: { $set: { initStatus: true, orphan: false } },
    //     },
    //   },
    // ]);

    interface INodeSearched {
      [key: string]: boolean;
    }
    const nodeSearched: INodeSearched = {
      [newInit.id.toString()]: true,
    };
    // const nodeSearched: { [key: string]: boolean } = { [newInit.id.toString()]: true };

    interface INode {
      // status: IStatus & {transitions: ITransition[]};
      status: IStatusPopulated;
      // status: IStatus & {
      //   transitions: Array<{
      //     name: string;
      //     transitionId: mongoose.Types.ObjectId;
      //     targetId: mongoose.Types.ObjectId;
      //   }>;
      // };
      checked: boolean;
    }
    const queue: INode[] = [
      {
        status: {
          ...newInit,
          orphan: false,
          initStatus: true,
        },
        checked: false,
      },
    ];

    // let neighboorsLeft = true;
    // // while (queue.some((item) => !item.checked)){}
    // while (neighboorsLeft) {
    //   const currentNode: INode | undefined = queue.find(
    //     (item) => !item.checked
    //   );

    //   if (!currentNode) {
    //     neighboorsLeft = false;
    //     break;
    //   }

    //   // transitions now include the targetId
    //   if (currentNode?.status?.transitions.length > 0) {
    //     for (const transition of currentNode.status.transitions) {
    //       // if the targetId is not in the nodeSearched object
    //       if (!nodeSearched[transition?.targetId?.toString()]) {
    //         // if it is not in the nodeSearched object, add it and set it to true
    //         nodeSearched[transition?.targetId?.toString()] = true;
    //         // find the status that the newInit is transitioning to
    //         const status = statuses.find(
    //           (status) =>
    //             status._id.toString() === transition.targetId.toString()
    //         );
    //         if (!status) {
    //           return;
    //         }
    //         status.orphan = false;
    //         await status.save();
    //         // add the status to the queue so we can check its neighboors
    //         queue.push({
    //           status,
    //           checked: false,
    //         });
    //       }
    //     }
    //   }
    //   currentNode.checked = true;
    // }

    // const orphans = statuses.filter((status) => !nodeSearched[status.id]);

    // for (const status of orphans) {
    //   status.orphan = true;
    //   await status.save();
    // }

    // we check if there are any nodes left to check
    console.log(
      "queue",
      queue,
      "queue.some",
      queue.some((item) => !item.checked)
    );
    while (queue.some((item) => !item.checked)) {
      const currentNode = queue.find((item) => !item.checked);
      console.log("currentNode", currentNode);
      if (!currentNode) break;
      // console.log("currentNode.status", currentNode.status);
      if (currentNode.status.transitions?.length) {
        for (const transition of currentNode.status.transitions) {
          // if the targetId is not in the nodeSearched object
          console.log(
            "nodeSearched",
            nodeSearched
            // "transition.targetId.toString()",
            // transition.targetId.toString(),
            // "transition",
            // transition
          );

          if (!nodeSearched[transition.targetId.toString()]) {
            // console.log(
            //   "doesnt find targetId in nodeSearched",
            //   nodeSearched[transition.targetId.toString()]
            // );

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
    console.log("nodeSearched", nodeSearched);

    const orphans = statuses.filter(
      (status) => !nodeSearched[status._id.toString()]
    );
    console.log("orphans", orphans);

    // we check if the old init is an orphan by
    // checking if it is in the nodeSearched object
    if (!nodeSearched[oldInit._id.toString()]) {
      oldInit.orphan = true;
      await oldInit.save();
    }
    for (const status of orphans) {
      status.orphan = true;
      await status.save();
    }
    const newStatuses = await Status.find({});
    res.status(202).json({ statuses, newStatuses });
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

// method: POST
// path: /api/statuses/reset
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
    console.log("statuses before transitions", statuses);

    if (statuses.length === 0) {
      res.status(400).json({ message: "Statuses array is empty" });
      return;
    }

    // create transitions array with the transitions from the initStatus to review, from review to deploy, from cancel to rejected, from rejected to deploy
    // transitions: ITransition[]
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

    // add the transitions to the statuses
    // statuses
    //   .find((status) => status.name === "start")
    //   ?.transitions.push(
    //     transitions?.find((transition) => transition.name === "startReview")
    //   );

    // Add the transitions to the statuses using type guards to check for undefined values
    const startStatus = statuses.find((status) => status.name === "start");
    const startReviewTransition = transitions.find(
      (transition) => transition.name === "startReview"
    );

    if (startStatus && startReviewTransition) {
      startStatus.transitions.push(startReviewTransition._id);
    }
    // now do the same for the other statuses and transitions
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

    // update the statuses orphan property
    statuses.find((status) => status.name === "review")!.orphan = false;
    statuses.find((status) => status.name === "deploy")!.orphan = false;
    // save the statuses
    for (const status of statuses) {
      await status.save();
    }

    res.status(201).json({ statuses, transitions });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
