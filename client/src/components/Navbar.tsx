import { Link, useLocation } from "wouter";
import { Home, User, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-lg px-3 py-1.5 transition-all">
            <Image className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] bg-clip-text text-transparent">
              UniConnect
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-2">
          <Link href="/" data-testid="link-feed">
            <Button 
              variant={location === "/" ? "default" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Feed</span>
            </Button>
          </Link>
          
          <Link href="/profile" data-testid="link-profile">
            <Button 
              variant={location === "/profile" ? "default" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
