import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
        <FileQuestion className="w-8 h-8" />
      </div>
      <AppLogo className="mb-6 scale-110" />
      <h2 className="text-3xl font-bold tracking-tight mb-4">Page not found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
