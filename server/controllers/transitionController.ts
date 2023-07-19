import { Request, Response } from "express";
import Status from "../models/statusModel";
import Transition from "../models/transitionModel";

/* addTransition,
  getTransitions,
  deleteTransition, */

export const addTransition = async (req: Request, res: Response) => {
  const { name, source, target } = req.body;
  try {
    const transitionNameExists = await Transition.findOne({ name });
    if (transitionNameExists) {
      res.status(400).json({ message: "Transition already exists" });
      return;
    }
    const transition = await Transition.create({ name, source, target });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransitions = async (req: Request, res: Response) => {
  try {
    const transitions = await Transition.find({});
    res.status(200).json(transitions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTransition = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const transitionToDelete = await Transition.findOneAndDelete({ name });
    res.status(201).json(transitionToDelete);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
