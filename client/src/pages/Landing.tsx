import { Image, Heart, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] bg-clip-text text-transparent">
              UniConnect
            </span>
          </div>
          <a href="/api/login">
            <Button 
              className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]"
              data-testid="button-login"
            >
              Log In
            </Button>
          </a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] bg-clip-text text-transparent">
            Connect with Your Community
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Share moments, engage with friends, and discover new connections in a vibrant social experience.
          </p>
          <a href="/api/login">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-lg px-8"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 hover-elevate transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Share & Engage</h3>
            <p className="text-muted-foreground">
              Post your moments and interact with others through likes and comments.
            </p>
          </Card>

          <Card className="p-6 hover-elevate transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real Conversations</h3>
            <p className="text-muted-foreground">
              Engage in meaningful discussions and connect with your community.
            </p>
          </Card>

          <Card className="p-6 hover-elevate transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Build Your Network</h3>
            <p className="text-muted-foreground">
              Discover and connect with people who share your interests.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
