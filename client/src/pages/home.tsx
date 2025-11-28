import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

export default function Home() {
  const { data: health, isLoading, error } = useQuery<HealthResponse>({
    queryKey: ["/api/health"],
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-home">
      <header className="border-b h-16 flex items-center px-6" data-testid="header-main">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold" data-testid="text-app-title">LeadConverter</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Badge variant="outline" className="font-mono text-xs" data-testid="badge-version">
            v1.0.0
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-welcome-title">
              Welcome to LeadConverter
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-welcome-description">
              Your full-stack application is up and running. The frontend and backend are connected and ready for development.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            data-testid="grid-status-cards"
          >
            <Card data-testid="card-frontend-status">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Frontend</CardTitle>
                <CheckCircle className="h-4 w-4 text-status-online" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono" data-testid="text-frontend-status">Active</div>
                <p className="text-sm text-muted-foreground mt-1">
                  React 18 + TypeScript + Vite
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-backend-status">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Backend</CardTitle>
                {isLoading ? (
                  <div className="h-4 w-4 rounded-full bg-status-away animate-pulse" data-testid="indicator-backend-loading" />
                ) : error ? (
                  <div className="h-4 w-4 rounded-full bg-status-busy" data-testid="indicator-backend-error" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-status-online" data-testid="indicator-backend-active" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono" data-testid="text-backend-status">
                  {isLoading ? "Checking..." : error ? "Offline" : "Active"}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Express.js + TypeScript
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-database-status">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono" data-testid="text-database-status">Ready</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Supabase PostgreSQL
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-styling-status">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Styling</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono" data-testid="text-styling-status">Configured</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Tailwind CSS + Framer Motion
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card data-testid="card-api-health">
              <CardHeader>
                <CardTitle className="text-lg font-medium">API Health Check</CardTitle>
                <CardDescription>
                  Response from the backend API endpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2" data-testid="skeleton-health-response">
                    <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                    <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                ) : error ? (
                  <div className="text-destructive" data-testid="text-health-error">
                    Failed to connect to backend. Make sure the server is running.
                  </div>
                ) : (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto font-mono text-sm" data-testid="text-health-response">
                    {JSON.stringify(health, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-center gap-4">
            <Button data-testid="button-get-started">
              Get Started
            </Button>
            <Button variant="outline" data-testid="button-documentation">
              Documentation
            </Button>
          </motion.div>
        </motion.div>
      </main>

      <footer className="border-t mt-12" data-testid="footer-main">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-muted-foreground" data-testid="text-footer-title">
            LeadConverter - Full-Stack Application Scaffolding
          </p>
          <p className="text-sm text-muted-foreground font-mono" data-testid="text-footer-timestamp">
            {health?.timestamp ? new Date(health.timestamp).toLocaleString() : ""}
          </p>
        </div>
      </footer>
    </div>
  );
}
