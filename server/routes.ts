import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.gestures.list.path, async (req, res) => {
    const gestures = await storage.getGestures();
    res.json(gestures);
  });

  app.post(api.gestures.create.path, async (req, res) => {
    try {
      const input = api.gestures.create.input.parse(req.body);
      const gesture = await storage.createGesture(input);
      res.status(201).json(gesture);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.gestures.delete.path, async (req, res) => {
    await storage.deleteGesture(Number(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}
