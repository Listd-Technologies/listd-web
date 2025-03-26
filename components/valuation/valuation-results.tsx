"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUpIcon } from "lucide-react";

// This component is only kept as a placeholder since we've moved results to the final step of the form
export function ValuationResults() {
  return (
    <Card className="w-full flex flex-col justify-center items-center py-8 bg-muted/10">
      <CardContent className="text-center space-y-3">
        <div className="mx-auto bg-muted/20 w-12 h-12 rounded-full flex items-center justify-center">
          <TrendingUpIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Fill out the form to see your property valuation results here.
        </p>
      </CardContent>
    </Card>
  );
}
