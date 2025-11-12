"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Database } from "@/lib/supabase/types/database.gen";
import { FileText, Download } from "lucide-react";

type Evidence = Database["public"]["Tables"]["evidences"]["Row"];

interface EvidenceListProps {
  evidence: Evidence[];
  isLoading: boolean;
}

export function EvidenceList({ evidence, isLoading }: EvidenceListProps) {
  if (isLoading) {
    return <div className="text-white/60">Loading evidence...</div>;
  }

  if (evidence.length === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6">
          <p className="text-white/60 text-center">
            No evidence has been uploaded for this milestone yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {evidence.map((item) => (
        <Card
          key={item.id}
          className="bg-gray-900/50 border-gray-700 overflow-hidden"
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white/80" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-white font-medium truncate"
                title={item.file_name || "File"}
              >
                {item.file_name || "Uploaded File"}
              </p>
              <p
                className="text-white/60 text-sm truncate"
                title={item.description || ""}
              >
                {item.description || "No description"}
              </p>
            </div>
            <a
              href={item.file_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              download={item.file_name}
              className="flex-shrink-0 text-white/60 hover:text-white"
            >
              <Download className="w-5 h-5" />
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
