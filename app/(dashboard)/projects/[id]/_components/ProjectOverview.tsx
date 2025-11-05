import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/projectHelpers";

interface ProjectOverviewProps {
  title: string;
  description: string;
  totalAmount: number;
}

export function ProjectOverview({ title, description, totalAmount }: ProjectOverviewProps) {
  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardContent className="p-8">
        <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
        <p className="text-white/80 text-lg mb-8">{description}</p>
        <Badge className="bg-black text-white px-4 py-2 text-lg">
          Total: {formatCurrency(totalAmount)}
        </Badge>
      </CardContent>
    </Card>
  );
}

