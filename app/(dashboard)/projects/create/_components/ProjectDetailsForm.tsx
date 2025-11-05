"use client";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

// Define the props it accepts from the parent
interface ProjectDetailsFormProps {
  projectTitle: string;
  setProjectTitle: (value: string) => void;
  projectDescription: string;
  setProjectDescription: (value: string) => void;
  totalAmount: number;
  setTotalAmount: (value: number) => void;
  expectedDeliveryDate: string;
  setExpectedDeliveryDate: (value: string) => void;
}

export function ProjectDetailsForm({
  projectTitle,
  setProjectTitle,
  projectDescription,
  setProjectDescription,
  totalAmount,
  setTotalAmount,
  expectedDeliveryDate,
  setExpectedDeliveryDate,
}: ProjectDetailsFormProps) {
  return (
    <>
      {/* Project Details */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Project Title
          </label>
          <Input
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="Enter project title"
            className="bg-muted/50 border-border text-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Brief Description
          </label>
          <Textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Enter project description"
            rows={4}
            className="bg-muted/50 border-border text-foreground resize-none"
          />
        </div>
      </div>

      {/* Budget Allocation */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Total money allocated to the collaborator:
          </label>
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-2xl font-bold text-foreground">
                ${totalAmount.toLocaleString("en-US")} USD
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>$100</span>
                <span>$20,000</span>
              </div>
              <Slider
                value={[totalAmount]}
                onValueChange={(value) => setTotalAmount(value[0])}
                min={100}
                max={20000}
                step={50}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expected Delivery Date */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Expected Delivery Date
        </label>
        <Input
          type="date"
          value={expectedDeliveryDate}
          onChange={(e) => setExpectedDeliveryDate(e.target.value)}
          className="bg-muted/50 border-border text-foreground"
        />
      </div>
    </>
  );
}
