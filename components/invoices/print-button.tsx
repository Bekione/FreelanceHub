"use client";

import { Printer } from "lucide-react";
import { Button } from "../ui/button";

export function PrintButton() {
  return (
    <Button
      variant="default"
      size="lg"
      onClick={() => window.print()}
      className=""
    >
      <Printer className="h-4 w-4" />
      Print / Save PDF
    </Button>
  );
}
