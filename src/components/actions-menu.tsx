import { Search, ShoppingCart, User } from 'lucide-react'
import { Button } from './ui/button'
import { ButtonGroup } from './ui/button-group'
import { Input } from './ui/input'
import { Link } from '@tanstack/react-router'
import { ModeToggle } from './mode-toggle'

const ActionsMenu = () => {
  return (
    <div>
      <div className="flex gap-5">
        <ButtonGroup>
          <Input placeholder="Buscar..." className="h-full" />
          <Button variant="outline" className="h-full" aria-label="Search">
            <Search className="size-8" />
          </Button>
        </ButtonGroup>
        <ModeToggle />
        <Button variant={'ghost'} className="size-14">
          <User className="size-8" />
        </Button>
        <Button variant={'ghost'} className="size-14">
          <Link to="/orders">
            <ShoppingCart className="size-8" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default ActionsMenu
