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
import { Search, User } from "lucide-react";
import Image from "next/image";

interface Freelancer {
  id: string;
  full_name: string;
  position: string;
  avatar_url?: string;
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
      if (searchTerm.trim() === "") return;

      setIsLoading(true);
      try {
        const query = supabase
          .from("freelancer_profiles")
          .select("id, full_name, position, avatar_url")
          .ilike("full_name", `%${searchTerm.trim()}%`);

        const { data, error } = await query.limit(20);

        console.log("searchTerm", searchTerm);
        console.log("data", data);

        if (error) {
          console.error("Error fetching freelancers:", error);
          return;
        }

        setFreelancers(data ?? []);
      } catch (error) {
        console.error("Error fetching freelancers:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 0) {
        fetchFreelancers(searchQuery);
      } else {
        fetchFreelancers();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchFreelancers]);

  useEffect(() => {
    if (isOpen) {
      fetchFreelancers();
    }
  }, [isOpen, fetchFreelancers]);

  // No need for local filtering since we're doing it in the database

  const handleSelectFreelancer = (freelancer: Freelancer) => {
    onSelect(freelancer);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-background border-border max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Assign Collaborator
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Search and select a freelancer for your project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border text-foreground"
            />
          </div>

          {/* Freelancers List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading freelancers...
              </div>
            ) : freelancers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery
                  ? "No freelancers found"
                  : "No freelancers available"}
              </div>
            ) : (
              freelancers.map((freelancer) => (
                <div
                  key={freelancer.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedFreelancer?.id === freelancer.id
                      ? "bg-primary/10 border-primary/20"
                      : "bg-muted/30 border-border hover:bg-muted/50"
                  }`}
                  onClick={() => handleSelectFreelancer(freelancer)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      {freelancer.avatar_url ? (
                        <Image
                          src={freelancer.avatar_url}
                          alt={freelancer.full_name}
                          className="w-full h-full rounded-full object-cover"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {freelancer.full_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {freelancer.position}
                      </p>
                    </div>
                    {selectedFreelancer?.id === freelancer.id && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-foreground hover:bg-muted/50"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
