"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Contact } from "@/lib/sample-data"
import {
    User,
    Mail,
    Phone,
    Building,
    Briefcase,
    Tag,
    TrendingUp,
    Calendar,
    Plus,
    X,
    Edit,
    Save,
} from "lucide-react"
import { useState } from "react"

interface ContactDetailsPanelProps {
    contact: Contact | null
    onClose: () => void
    onUpdate?: (contact: Contact) => void
}

export function ContactDetailsPanel({ contact, onClose, onUpdate }: ContactDetailsPanelProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedContact, setEditedContact] = useState<Contact | null>(contact)
    const [newNote, setNewNote] = useState("")
    const [newTag, setNewTag] = useState("")

    if (!contact || !editedContact) {
        return (
            <div className="w-80 border-l border-gray-200 bg-gray-50 flex items-center justify-center p-6">
                <p className="text-sm text-gray-500 text-center">Select a conversation to view contact details</p>
            </div>
        )
    }

    const handleSave = () => {
        if (onUpdate && editedContact) {
            onUpdate(editedContact)
        }
        setIsEditing(false)
    }

    const handleAddNote = () => {
        if (newNote.trim() && editedContact) {
            setEditedContact({
                ...editedContact,
                notes: [...editedContact.notes, newNote.trim()],
            })
            setNewNote("")
        }
    }

    const handleAddTag = () => {
        if (newTag.trim() && editedContact && !editedContact.tags.includes(newTag.trim())) {
            setEditedContact({
                ...editedContact,
                tags: [...editedContact.tags, newTag.trim()],
            })
            setNewTag("")
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        if (editedContact) {
            setEditedContact({
                ...editedContact,
                tags: editedContact.tags.filter((tag) => tag !== tagToRemove),
            })
        }
    }

    const getLeadStatusColor = (status: string) => {
        switch (status) {
            case "new":
                return "bg-blue-100 text-blue-800"
            case "contacted":
                return "bg-yellow-100 text-yellow-800"
            case "qualified":
                return "bg-purple-100 text-purple-800"
            case "converted":
                return "bg-green-100 text-green-800"
            case "lost":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-50 to-white">
                <h3 className="font-semibold text-gray-900">Contact Details</h3>
                <div className="flex gap-2">
                    {isEditing ? (
                        <Button size="sm" variant="ghost" onClick={handleSave}>
                            <Save className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    {/* Contact Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-3 rounded-full">
                                <User className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                                {isEditing ? (
                                    <Input
                                        value={editedContact.name}
                                        onChange={(e) => setEditedContact({ ...editedContact, name: e.target.value })}
                                        className="font-semibold"
                                    />
                                ) : (
                                    <h4 className="font-semibold text-lg text-gray-900">{editedContact.name}</h4>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">{editedContact.phone}</span>
                            </div>
                            {editedContact.email && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-700">{editedContact.email}</span>
                                </div>
                            )}
                            {editedContact.customFields?.company && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Building className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-700">{editedContact.customFields.company}</span>
                                </div>
                            )}
                            {editedContact.customFields?.position && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Briefcase className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-700">{editedContact.customFields.position}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Lead Status */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-gray-500" />
                            <h5 className="font-medium text-sm text-gray-900">Lead Status</h5>
                        </div>
                        {isEditing ? (
                            <Select
                                value={editedContact.leadStatus}
                                onValueChange={(value: any) => setEditedContact({ ...editedContact, leadStatus: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="qualified">Qualified</SelectItem>
                                    <SelectItem value="converted">Converted</SelectItem>
                                    <SelectItem value="lost">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <Badge className={getLeadStatusColor(editedContact.leadStatus)}>
                                {editedContact.leadStatus.charAt(0).toUpperCase() + editedContact.leadStatus.slice(1)}
                            </Badge>
                        )}
                    </div>

                    <Separator />

                    {/* Tags */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-gray-500" />
                            <h5 className="font-medium text-sm text-gray-900">Tags</h5>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {editedContact.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="bg-green-50 border-green-200 text-green-700">
                                    {tag}
                                    {isEditing && (
                                        <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-green-900">
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </Badge>
                            ))}
                        </div>
                        {isEditing && (
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add tag..."
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                                    className="text-sm"
                                />
                                <Button size="sm" onClick={handleAddTag}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Additional Info */}
                    <div className="space-y-3">
                        <h5 className="font-medium text-sm text-gray-900">Additional Information</h5>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Source:</span>
                                <span className="font-medium text-gray-900">{editedContact.source}</span>
                            </div>
                            {editedContact.value && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Value:</span>
                                    <span className="font-medium text-gray-900">${editedContact.value.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Last Contact:</span>
                                <span className="font-medium text-gray-900">
                                    {new Date(editedContact.lastContact).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Notes */}
                    <div className="space-y-3">
                        <h5 className="font-medium text-sm text-gray-900">Notes</h5>
                        <div className="space-y-2">
                            {editedContact.notes.map((note, index) => (
                                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-sm text-gray-700">{note}</p>
                                </div>
                            ))}
                        </div>
                        {isEditing && (
                            <div className="space-y-2">
                                <Textarea
                                    placeholder="Add a note..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    className="text-sm"
                                    rows={3}
                                />
                                <Button size="sm" onClick={handleAddNote} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Note
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
