import { useUser } from "@/context/UserContext"
import { useEffect, useState } from "react"
import Link from "next/link"
import NotificationBell from "@/components/NotificationBell"
import { genUserAvatar, logOut, createPlaylist } from "@/lib/actions"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "shadcn/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "shadcn/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
} from "shadcn/dialog"
import { Input } from "shadcn/input"
import { Button } from "shadcn/button"
import { Avatar, AvatarImage } from "shadcn/avatar"
import { Menu, LogOut, UserPlus, LogIn, Home, PlusCircle, Settings, Radio, Shield } from "lucide-react"

export default function NavMenu() {
    const { isLoggedIn, isAdmin, uuid } = useUser()
    const [avatarUrl, setAvatarUrl] = useState("")
    const [openDialog, setOpenDialog] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        url: "",
    })

    useEffect(() => {
        if (isLoggedIn) {
            let isMounted = true

            async function fetchAvatar() {
                const url = await genUserAvatar(uuid)
                if (isMounted) {
                    setAvatarUrl(url)
                }
            }

            fetchAvatar()
            return () => {
                isMounted = false
            }
        }
    }, [isLoggedIn, uuid])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        try {
            await createPlaylist(formData.name, formData.description, formData.url)
            setOpenDialog(false)
            setFormData({ name: "", description: "", url: "" })
        } catch (error) {
            console.error("Error creating playlist:", error.message)
        }
    }

    return (
        <header className="w-full border-b px-2">
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <div className="grid gap-4 py-4">
                                <Link href="/" className="flex items-center gap-2">
                                    <Home className="h-4 w-4" /> Home
                                </Link>
                                <Link href="/playlist" className="flex items-center gap-2">
                                    <Radio className="h-4 w-4" /> Public Playlists
                                </Link>
                                {isAdmin && (
                                    <Link href="/admin" className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" /> Admin Panel
                                    </Link>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2 text-sm font-medium">
                            <Home className="h-4 w-4" /> Home
                        </Link>
                        <Link href="/playlist" className="flex items-center gap-2 text-sm font-medium">
                            <Radio className="h-4 w-4" /> Public Playlists
                        </Link>
                        {isAdmin && (
                            <Link href="/admin" className="flex items-center gap-2 text-sm font-medium">
                                <Shield className="h-4 w-4" /> Admin Panel
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {!isLoggedIn && (
                        <div className="flex gap-2">
                            <Link href="/login">
                                <Button variant="outline" size="sm">
                                    <LogIn className="mr-2 h-4 w-4" /> Log in
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">
                                    <UserPlus className="mr-2 h-4 w-4" /> Register
                                </Button>
                            </Link>
                        </div>
                    )}

                    {isLoggedIn && (
                        <div className="flex items-center gap-2">
                            <NotificationBell userId={uuid} />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="h-10 w-10 cursor-pointer">
                                        <AvatarImage src={avatarUrl} alt="Avatar" className={"w-fit h-fit"} />
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link href="/user" className="inline-flex items-center w-full">
                                            <Settings className="h-4 w-4 mr-2" /> User Panel
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setOpenDialog(true)} className="cursor-pointer">
                                        <PlusCircle className="h-4 w-4 mr-2" /> Create Playlist
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={logOut} className="cursor-pointer">
                                        <LogOut className="h-4 w-4 mr-2" /> Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Playlist</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            placeholder="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                        <Input
                            placeholder="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                        />
                        <Input
                            placeholder="Accessible URL (e.g. party-mix)"
                            name="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            required
                            pattern="^[a-zA-Z-]+$"
                        />
                        {!/^[a-zA-Z-]*$/.test(formData.url) && (
                            <p className="text-sm text-red-500">
                                Invalid format. Only letters and dashes are allowed.
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpenDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </header>
    )
}
