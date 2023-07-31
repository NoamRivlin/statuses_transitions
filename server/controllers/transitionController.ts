import { Request, Response } from "express";
import Status from "../models/statusModel";
import Transition from "../models/transitionModel";
import { IStatus } from "../models/statusModel";
import { ITransition } from "../models/transitionModel";


export const addTransition = async (req: Request, res: Response) => {
  const { name, sourceId, targetId } = req.body;

  try {
    const transitionNameExists = await Transition.findOne({
      name,
    });
    if (transitionNameExists) {
      res.status(400).json({ message: "Transition already exists" });
      return;
    }

    const transition: ITransition = await Transition.create({
      name,
      sourceId: sourceId,
      targetId: targetId,
    });

    const sourceStatus: IStatus | null = await Status.findById(sourceId);
    if (!sourceStatus?.orphan) {
      const targetStatus: IStatus | null = await Status.findById(targetId);
      if (targetStatus && targetStatus?.orphan) {
        targetStatus.orphan = false;
        await targetStatus.save();
      }
    }

    sourceStatus?.transitions.push(transition._id);

    await sourceStatus?.save();

    res.status(201).json(transition);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransitions = async (req: Request, res: Response) => {
  try {
    const allTransitions = await Transition.find({});
    res.status(200).json(allTransitions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteTransition = async (req: Request, res: Response) => {
  // TODO: deleting a transition should update the statuses that are affected by it
  // like if the transition is the only one that points to a status, that status should be marked as orphan 
  // if removing reviewDeploy then deploy should be marked as orphan and not final
  const { id } = req.body;
  try {
    const transitionToDelete = await Transition.findOne({ _id: id });
    console.log('transitionToDelete', transitionToDelete);
    
    if (!transitionToDelete) {
      res.status(400).json({ message: "Transition not found" });
      return;
    }

    const sourceId = transitionToDelete.sourceId;
    const sourceStatus = await Status.findById(sourceId);
    if (!sourceStatus) {
      res.status(400).json({ message: "Source status not found" });
      return;
    }

    sourceStatus.transitions = sourceStatus.transitions.filter(
      (transiton) => transiton !== transitionToDelete._id
    );
    await sourceStatus.save();
    await transitionToDelete.deleteOne();
    const updatedTransitions = await Transition.find({});
        
    res.status(201).json(updatedTransitions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
