import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, PenLine } from "lucide-react";

interface DashboardCardsProps {
  total: number;
  published: number;
  draft: number;
}

const CARD_CONFIG = [
  { key: "total", label: "Total Stories", icon: FileText },
  { key: "published", label: "Published", icon: CheckCircle2 },
  { key: "draft", label: "Drafts", icon: PenLine },
] as const;

export function DashboardCards({ total, published, draft }: DashboardCardsProps) {
  const values = { total, published, draft };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CARD_CONFIG.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <Icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{values[key]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
