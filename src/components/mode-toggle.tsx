import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-14">
          <Sun className="size-8 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-8 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background">
        <DropdownMenuItem
          className="focus:bg-muted focus:text-foreground"
          onClick={() => setTheme("light")}
        >
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem
          className="focus:bg-muted focus:text-foreground"
          onClick={() => setTheme("dark")}
        >
          Oscuro
        </DropdownMenuItem>
        <DropdownMenuItem
          className="focus:bg-muted focus:text-foreground"
          onClick={() => setTheme("system")}
        >
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
