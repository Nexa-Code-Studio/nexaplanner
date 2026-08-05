import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  action?: React.ReactNode;
}

export default function PageHeader({ title, breadcrumbs, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            NexaPlanner
          </Link>
          {breadcrumbs.map((item, index) => (
            <div key={item.name} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
              {item.href ? (
                <Link href={item.href} className="hover:text-foreground transition-colors">
                  {item.name}
                </Link>
              ) : (
                <span className="text-muted-foreground/80 font-normal">{item.name}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      </div>

      {/* Action Element */}
      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
}
