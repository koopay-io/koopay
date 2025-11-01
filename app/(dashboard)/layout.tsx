'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { TrustlessWorkProvider } from '@/components/providers/TrustlessWorkProvider';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    title: 'New project assigned',
    message: 'You have been assigned to the Logo Design project',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    title: 'Payment received',
    message: 'Payment of $1,500 has been received for Landing Page project',
    time: '1 day ago',
    read: true,
  },
  {
    id: 3,
    title: 'Milestone completed',
    message: 'Milestone 3 of the Web Development project has been completed',
    time: '3 days ago',
    read: true,
  },
];

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchPosition, setSearchPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const router = useRouter();

  const mockUsers = [
    { name: 'Micaela Descotte', avatar: '/avatars/micaela-descotte.png' },
    { name: 'Renzo Barcos', avatar: '/avatars/renzo-barcos.png' },
    { name: 'Tomas Salina', avatar: '/avatars/tomas-salina.png' },
    { name: 'Steven Molina', avatar: '/avatars/steven-molina.png' },
  ];

  const filteredUsers = mockUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.length > 0);

    if (value.length > 0) {
      const rect = e.target.getBoundingClientRect();
      setSearchPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <TrustlessWorkProvider>
      <div className="min-h-screen bg-background">
        {/* Sticky Navigation Bar */}
        <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Koopay" className="h-8 w-auto" width={32} height={32} />
              </Link>

              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="w-[448px] max-w-md relative">
                  <div className="relative">
                    <Input
                      placeholder="Search profile..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="bg-[#16132C] text-tertiary-foreground placeholder:text-primary-foreground rounded-full px-6 border-none outline-none hover:outline-none focus-visible:ring-0"
                    />
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary-foreground h-4 w-4" />
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                  <Link href="/profile">
                    <Button variant="default" className="gap-2">
                      <Image
                        src="/icons/profile-icon.svg"
                        alt="Profile"
                        className="h-4 w-4"
                        width={16}
                        height={16}
                      />
                      Go to profile
                    </Button>
                  </Link>

                  {/* Notifications Sheet */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Image
                          src="/icons/notification-icon.svg"
                          alt="Notifications"
                          className="h-4 w-4"
                          width={16}
                          height={16}
                        />
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px]">
                      <SheetHeader>
                        <SheetTitle>Notifications</SheetTitle>
                        <SheetDescription>
                          You have {mockNotifications.filter((n) => !n.read).length} unread
                          notifications
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        {mockNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 rounded-lg border ${
                              notification.read
                                ? 'bg-muted/50 border-muted-foreground/20'
                                : 'bg-primary/5 border-primary/20'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <Image
                      src="/icons/logout-icon.svg"
                      alt="Logout"
                      className="h-4 w-4"
                      width={16}
                      height={16}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>{children}</main>

        {/* Search Results Dropdown Portal */}
        {showSearchResults &&
          filteredUsers.length > 0 &&
          typeof window !== 'undefined' &&
          createPortal(
            <div
              className="fixed bg-background border border-border rounded-lg shadow-xl z-[9999] max-h-60 overflow-y-auto"
              style={{
                top: searchPosition.top,
                left: searchPosition.left,
                width: searchPosition.width,
              }}
            >
              {filteredUsers.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-b-0"
                >
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                    width={32}
                    height={32}
                  />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
              ))}
            </div>,
            document.body
          )}
      </div>
    </TrustlessWorkProvider>
  );
}
