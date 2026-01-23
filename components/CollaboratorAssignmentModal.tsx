"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { Search, Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Add avatar_url back to the interface to satisfy the parent component (Collaborator type)
interface Freelancer {
  id: string;
  full_name: string;
  position: string;
  avatar_url: string | null;
}

interface CollaboratorAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (freelancer: Freelancer) => void;
  selectedFreelancer?: Freelancer | null;
}

export function CollaboratorAssignmentModal({
  isOpen,
  onClose,
  onSelect,
  selectedFreelancer,
}: CollaboratorAssignmentModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const fetchFreelancers = useCallback(
    async (searchTerm = "") => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("organizations")
          .select(
            `
            *,
            user_organization!inner (
              user_id
            )
          `,
          )
          .eq("type", "provider")
          .limit(20);

        if (searchTerm.trim()) {
          query = query.or(
            `name.ilike.%${searchTerm.trim()}%,legal_name.ilike.%${searchTerm.trim()}%`,
          );
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching providers:", error);
          return;
        }

        // Ensure the mapping matches the interface exactly
        const mappedFreelancers: Freelancer[] = (data || [])
          .map((org: any) => {
            const userId = org.user_organization?.[0]?.user_id;

            if (!userId) return null;

            const displayName =
              org.legal_type === "individual" ? org.legal_name : org.name;

            return {
              id: userId,
              full_name: displayName,
              position: org.industry_type || "Provider",
              // Use the org's avatar if available, otherwise null
              avatar_url: org.avatar_url || null,
            };
          })
          // Type predicate ensures TypeScript knows 'f' is a valid Freelancer
          .filter((f): f is Freelancer => f !== null);

        setFreelancers(mappedFreelancers);
      } catch (error) {
        console.error("Error fetching providers:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [supabase],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFreelancers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchFreelancers]);

  useEffect(() => {
    if (isOpen) {
      fetchFreelancers();
    }
  }, [isOpen, fetchFreelancers]);

  const handleSelectFreelancer = (freelancer: Freelancer) => {
    onSelect(freelancer);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#16132C] border-gray-800 text-white max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-white">Assign Collaborator</DialogTitle>
          <DialogDescription className="text-gray-400">
            Search and select a provider for your project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading providers...
              </div>
            ) : freelancers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? "No providers found" : "No providers available"}
              </div>
            ) : (
              freelancers.map((freelancer) => (
                <div
                  key={freelancer.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center gap-3 ${
                    selectedFreelancer?.id === freelancer.id
                      ? "bg-blue-900/20 border-blue-500"
                      : "bg-gray-900/30 border-gray-700 hover:border-gray-500"
                  }`}
                  onClick={() => handleSelectFreelancer(freelancer)}
                >
                  <Avatar className="h-10 w-10 border border-gray-700">
                    <AvatarImage src={freelancer.avatar_url || undefined} />
                    <AvatarFallback className="bg-gray-800 text-gray-400">
                      <Building2 className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">
                      {freelancer.full_name}
                    </h4>
                    <p className="text-sm text-gray-400 truncate">
                      {freelancer.position}
                    </p>
                  </div>

                  {selectedFreelancer?.id === freelancer.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-400 pointer-events-none hover:text-blue-400"
                    >
                      Selected
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-700 text-white hover:bg-gray-800 hover:text-white"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
