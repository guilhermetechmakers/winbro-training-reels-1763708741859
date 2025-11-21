import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Library, 
  Upload, 
  BookOpen, 
  Settings, 
  BarChart3,
  Users,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Library", href: "/library", icon: Library },
  { name: "Upload Reel", href: "/upload", icon: Upload },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

const adminNavigation = [
  { name: "Admin Dashboard", href: "/admin", icon: Shield },
  { name: "User Management", href: "/admin/users", icon: Users },
];

export default function Sidebar() {
  // TODO: Get user role from auth context
  const isAdmin = false; // Replace with actual auth check

  return (
    <aside className="w-sidebar bg-background-primary border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground-primary">Winbro Training</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "nav-item",
                  isActive ? "nav-item-active" : "nav-item-inactive"
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
        
        {isAdmin && (
          <>
            <div className="h-px bg-border my-4" />
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "nav-item",
                      isActive ? "nav-item-active" : "nav-item-inactive"
                    )
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </>
        )}
      </nav>
    </aside>
  );
}
