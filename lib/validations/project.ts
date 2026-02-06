import { z } from "zod";

export const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  percentage: z.number().min(1, "Percentage must be at least 1").max(100, "Percentage cannot exceed 100"),
  deadline: z.string().min(1, "Deadline is required"),
});

export const createProjectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  total_amount: z.coerce.number().positive("Amount must be positive"),
  expected_delivery_date: z.string().min(1, "Delivery date is required"),
  freelancer_id: z.string().uuid("Invalid freelancer ID").nullable().optional(),
  freelancer_address: z
    .string()
    .trim()
    .nullable()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        return /^G[A-Z2-7]{55}$/.test(value);
      },
      { message: "Invalid Stellar public key" },
    ),
  milestones: z
    .array(milestoneSchema)
    .min(1, "At least one milestone is required")
    .refine(
      (milestones) => {
        const total = milestones.reduce((sum, m) => sum + m.percentage, 0);
        return total === 100;
      },
      { message: "Milestone percentages must sum to exactly 100%" },
    ),
})
  .refine(
    (data) => {
      const hasId = Boolean(data.freelancer_id);
      const hasAddress = Boolean(data.freelancer_address);
      return (hasId && !hasAddress) || (!hasId && hasAddress);
    },
    {
      message:
        "Assign a collaborator by selecting a provider or entering a wallet address (choose exactly one).",
      path: ["freelancer_address"],
    },
  );

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type MilestoneInput = z.infer<typeof milestoneSchema>;
