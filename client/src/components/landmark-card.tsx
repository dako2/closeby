import { type Landmark } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function LandmarkCard({ landmark }: { landmark: Landmark }) {
  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle className="text-lg">{landmark.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{landmark.description}</p>
        {landmark.thumbnail && (
          <img
            src={landmark.thumbnail}
            alt={landmark.title}
            className="w-full h-40 object-cover rounded-md mb-4"
          />
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => window.open(`https://wikipedia.org/wiki/${landmark.wikipediaId}`, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Wikipedia
        </Button>
      </CardContent>
    </Card>
  );
}
