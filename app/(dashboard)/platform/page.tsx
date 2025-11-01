import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DonutChart } from "@/components/donut-chart";
import { Star, User, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="container mx-auto px-6 py-8">
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12 h-[330px]">
        {/* Left Column - Profile & Create Project */}
        <div className="lg:col-span-5 h-[330px] flex flex-col gap-4">
          {/* Profile Card */}
          <Card className="bg-gradient-to-tr from-[#3945EB] to-[#1989FA] border-0 text-white flex-1">
            <CardContent className="p-6 h-full flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-primary-foreground rounded-full flex items-center justify-center p-2">
                    <Image
                      src="/mini-logo.svg"
                      alt="Koopay"
                      className="h-12 w-auto"
                      width={45}
                      height={45}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-3xl">Paytrust Labs</h3>
                    <p className="text-white/80 text-md">Company</p>
                  </div>
                </div>
                <Link href={"/profile"}>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-[#162FA4] opacity-70 text-primary-foreground border-white/20 rounded-full px-4"
                  >
                    Edit profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Create Project Card */}
          <Link href={"/projects/create"} className="flex-1">
            <Card className="h-full bg-muted/50 border-muted-foreground/20">
              <CardContent className="p-6 h-full flex items-center justify-between">
                <div className="flex flex-col items-start gap-4">
                  <Image
                    src="/icons/star.svg"
                    alt="Start"
                    width={30}
                    height={30}
                  />
                  <div>
                    <h3 className="font-medium text-2xl">
                      Create a new <br /> payment project
                    </h3>
                  </div>
                </div>
                <div>
                  <Image
                    src="/icons/create-project.svg"
                    alt="Document icons"
                    width={160}
                    height={100}
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Right Column - Statistics */}
        <div className="lg:col-span-7 h-[330px] w-full">
          <DonutChart />
        </div>
      </div>

      {/* Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Your Projects</h2>
          <Badge variant="secondary" className="gap-1">
            3
          </Badge>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Project Card 1 - In Progress */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Logo Design</CardTitle>
                <div className="flex items-center gap-1 text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">In progress</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Collaborated with Juan Barcos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>From 14/02/25 to 14/04/25</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Divided into 5 Milestones</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="font-semibold text-lg">Total Pay: $4000USD</p>
                <Button className="w-full mt-3">View project</Button>
              </div>
            </CardContent>
          </Card>

          {/* Project Card 2 - Canceled */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Landing Page</CardTitle>
                <div className="flex items-center gap-1 text-red-600">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm">Canceled</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Collaborated with Micaela Gomez</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>From 13/02/25 to 29/05/25</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Divided into 23 Milestones</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="font-semibold text-lg">Total Pay: $1000USD</p>
                <Button className="w-full mt-3">View project</Button>
              </div>
            </CardContent>
          </Card>

          {/* Project Card 3 - Done */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Logo Design</CardTitle>
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">Done</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Collaborated with Juan Barcos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>From 14/02/25 to 14/04/25</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Divided into 5 Milestones</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="font-semibold text-lg">Total Pay: $3000USD</p>
                <Button className="w-full mt-3">View project</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
