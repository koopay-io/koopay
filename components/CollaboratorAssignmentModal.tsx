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
import { Search, User, Building2 } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// We keep your interface name 'Freelancer' for compatibility with the parent component
interface Freelancer {
  id: string; // This will be the User UUID
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
        // UPDATED QUERY: Fetch from organizations where type is 'provider'
        // We join with user_organization to get the actual User UUID
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
          // Search by name or legal_name
          query = query.or(
            `name.ilike.%${searchTerm.trim()}%,legal_name.ilike.%${searchTerm.trim()}%`,
          );
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching providers:", error);
          return;
        }

        // Map the organization data to the Freelancer interface
        const mappedFreelancers: Freelancer[] = (data || [])
          .map((org: any) => {
            const userId = org.user_organization?.[0]?.user_id;

            // Skip if no user is attached
            if (!userId) return null;

            // Use legal_name for individuals, name for companies
            const displayName =
              org.legal_type === "individual" ? org.legal_name : org.name;

            return {
              id: userId,
              full_name: displayName,
              position: org.industry_type || "Provider", // Default if industry is missing
              avatar_url: org.avatar_url,
            };
          })
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

  // Debounce search
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
      <DialogContent className="sm:max-w-[600px] bg-background border-border max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Assign Collaborator
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Search and select a provider for your project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border text-foreground"
            />
          </div>

          {/* Freelancers List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading providers...
              </div>
            ) : freelancers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No providers found" : "No providers available"}
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
                    <Avatar className="w-10 h-10 border border-border">
                      {freelancer.avatar_url ? (
                        <AvatarImage
                          src={freelancer.avatar_url}
                          alt={freelancer.full_name}
                        />
                      ) : null}
                      <AvatarFallback className="bg-muted">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>

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
