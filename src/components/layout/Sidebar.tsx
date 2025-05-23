import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart4,
  FileText,
  FileSpreadsheet,
  Clock,
  CheckSquare,
  AlertCircle,
  Settings,
  LogOut,
  Home,
  Users,
  FileX,
  Calculator,
  Building,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface SidebarProps {
  userRole: string;
  userName: string;
  onLogout: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
  children?: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ userRole, userName, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({
    settings: false
  });

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem("zicapi-user");
    toast.success("You have been logged out successfully");
    onLogout();
  };
  
  const handleSystemNameClick = () => {
    navigate("/dashboard");
    toast.success("Dashboard refreshed");
  };
  
  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };
  
  const getNavItems = (): NavItem[] => {
    const commonItems: NavItem[] = [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: <Home className="h-5 w-5" />,
        roles: ["admin", "regulator", "bank", "customs", "business"],
      },
      {
        name: "Data Import",
        path: "/data-import",
        icon: <FileSpreadsheet className="h-5 w-5" />,
        roles: ["admin", "bank", "customs", "business"],
      },
      {
        name: "Extensions",
        path: "/extensions",
        icon: <Clock className="h-5 w-5" />,
        roles: ["admin", "regulator", "bank", "customs", "business"],
      },
      {
        name: "Acquittals",
        path: "/acquittals",
        icon: <CheckSquare className="h-5 w-5" />,
        roles: ["admin", "regulator", "bank", "customs", "business"],
      },
      {
        name: "Compliance",
        path: "/compliance",
        icon: <AlertCircle className="h-5 w-5" />,
        roles: ["admin", "regulator", "customs"],
      },
      {
        name: "Reports & Analytics",
        path: "/reports",
        icon: <BarChart4 className="h-5 w-5" />,
        roles: ["admin", "regulator", "bank", "customs", "business"],
      },
      {
        name: "Penalties & Interest",
        path: "/penalties",
        icon: <Calculator className="h-5 w-5" />,
        roles: ["admin", "regulator", "customs", "business"],
      },
    ];
    
    const settingsItem: NavItem = {
      name: "Settings",
      path: "#",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin"],
      children: [
        {
          name: "User Management",
          path: "/users",
          icon: <Users className="h-5 w-5" />,
          roles: ["admin"],
        },
        {
          name: "Audit Trail",
          path: "/audit-trail",
          icon: <FileText className="h-5 w-5" />,
          roles: ["admin", "regulator"],
        },
        {
          name: "Financial Institutions",
          path: "/financial-institutions",
          icon: <Building className="h-5 w-5" />,
          roles: ["admin"],
        },
      ]
    };
    
    return [...commonItems, settingsItem].filter(item => {
      if (!item.roles.includes(userRole)) return false;
      
      if (item.children) {
        item.children = item.children.filter(child => child.roles.includes(userRole));
        return item.children.length > 0;
      }
      
      return true;
    });
  };
  
  const getRoleName = (role: string) => {
    switch (role) {
      case "admin": return "Admin";
      case "regulator": return "Regulator";
      case "bank": return "Bank";
      case "customs": return "Customs";
      case "business": return "Business";
      default: return role;
    }
  };

  const renderNavItem = (item: NavItem, index: number) => {
    if (item.children && item.children.length > 0) {
      const isExpanded = expandedItems[item.name.toLowerCase()];
      
      return (
        <div key={index} className="flex flex-col gap-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between",
              location.pathname.startsWith(item.path) && item.path !== "#"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
            onClick={() => toggleExpand(item.name.toLowerCase())}
          >
            <div className="flex items-center">
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </div>
            {isExpanded ? 
              <ChevronDown className="h-4 w-4" /> : 
              <ChevronRight className="h-4 w-4" />
            }
          </Button>
          
          {isExpanded && (
            <div className="ml-6 flex flex-col gap-1 border-l border-sidebar-border pl-2">
              {item.children.map((child, childIndex) => (
                <Link to={child.path} key={`${index}-${childIndex}`}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      isActive(child.path)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {child.icon}
                    <span className="ml-2">{child.name}</span>
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <Link to={item.path} key={index}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            isActive(item.path)
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          )}
        >
          {item.icon}
          <span className="ml-2">{item.name}</span>
        </Button>
      </Link>
    );
  };

  return (
    <div className="flex h-screen flex-col bg-sidebar text-sidebar-foreground border-r">
      <div className="p-4 cursor-pointer hover:bg-sidebar-accent/50" onClick={handleSystemNameClick}>
        <h2 className="text-xl font-bold text-accent">ZiCapi Flight</h2>
        <p className="text-sm font-medium text-secondary">Management System</p>
      </div>
      
      <Separator className="my-2 bg-sidebar-border" />
      
      <div className="px-4 py-2">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium">Logged in as:</p>
          <p className="text-base font-bold">{userName}</p>
          <p className="text-xs text-muted-foreground">{getRoleName(userRole)}</p>
        </div>
      </div>
      
      <Separator className="my-2 bg-sidebar-border" />
      
      <ScrollArea className="flex-1 px-2">
        <nav className="flex flex-col gap-1 py-2">
          {getNavItems().map((item, index) => renderNavItem(item, index))}
        </nav>
      </ScrollArea>
      
      <div className="mt-auto p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
