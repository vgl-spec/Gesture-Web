import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertGestureSample, type GestureSample } from "@shared/schema";

// GET /api/gestures
export function useGestures() {
  return useQuery({
    queryKey: [api.gestures.list.path],
    queryFn: async () => {
      const res = await fetch(api.gestures.list.path);
      if (!res.ok) throw new Error("Failed to fetch gestures");
      return api.gestures.list.responses[200].parse(await res.json());
    },
  });
}

// POST /api/gestures
export function useCreateGesture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertGestureSample) => {
      const res = await fetch(api.gestures.create.path, {
        method: api.gestures.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create gesture sample");
      return api.gestures.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.gestures.list.path] });
    },
  });
}

// DELETE /api/gestures/:id
export function useDeleteGesture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.gestures.delete.path, { id });
      const res = await fetch(url, { method: api.gestures.delete.method });
      if (!res.ok) throw new Error("Failed to delete gesture sample");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.gestures.list.path] });
    },
  });
}
