import { useEffect, useState } from "react"
import api from "../lib/api"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Search, Plus, Edit, Trash2, Tag, Save } from "lucide-react"
import toast from "react-hot-toast"
import { ConfirmDialog } from "./confirmDelete "
import { Skeleton } from "./ui/skeleton"
import axios from "axios"

type TagType = {
  _id: string
  name: string
}

export function TagsPage() {
  const [tags, setTags] = useState<TagType[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [newTag, setNewTag] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedName, setEditedName] = useState("")
  const [tagToDelete, setTagToDelete] = useState<TagType | null>(null)
  const [loading, setLoading] = useState(true) // 👈 loader state

const fetchTags = async () => {
  try {
    setLoading(true)
    const res = await api.get("/api/tags")
    // Sort tags by _id (which contains timestamp) in descending order to show newest first
    const sortedTags = res.data.sort((a: TagType, b: TagType) => b._id.localeCompare(a._id))
    setTags(sortedTags)
  } catch (error) {
    toast.error("Error fetching tags")
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    fetchTags()
  }, [])

  const handleAdd = async () => {
    if (!newTag.trim()) return
    try {
      await api.post("/api/tags", { name: newTag.trim() })
      toast.success("Tag added")
      setNewTag("")
      fetchTags()
    } catch (error) {
      toast.error("Error adding tag")
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editedName.trim()) return
    try {
      await axios.put(`http://localhost:5000/api/tags/${id}`, { name: editedName.trim() })
      toast.success("Tag updated")
      setEditingId(null)
      setEditedName("")
      fetchTags()
    } catch (error) {
      toast.error("Error updating tag")
    }
  }

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
     

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600">Manage your portfolio tags</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="New tag name"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="max-w-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
          <Button
            onClick={handleAdd}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
        />
      </div>

      {/* Loader / Tags Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 border-0 shadow-md">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-20" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTags.map((tag) => (
              <Card
                key={tag._id}
                className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white w-full min-w-0 overflow-hidden"
              >
              <CardHeader className="pb-3">
  <div className="flex items-start gap-3">
    {/* Left side: icon + name (or input when editing) */}
    <div className="flex-1 min-w-0 flex items-start gap-2">
      <Tag className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
      {editingId === tag._id ? (
        <Input
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUpdate(tag._id)}
          className="text-sm flex-1"
          autoFocus
        />
      ) : (
        <CardTitle className="text-lg text-gray-900 break-words">
          {tag.name}
        </CardTitle>
      )}
    </div>

    {/* Right side: actions */}
    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 flex-shrink-0">
      {editingId === tag._id ? (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => handleUpdate(tag._id)}
        >
          <Save className="h-4 w-4 text-green-600" />
        </Button>
      ) : (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => {
            setEditingId(tag._id)
            setEditedName(tag.name)
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-red-600"
        onClick={() => setTagToDelete(tag)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </div>
</CardHeader>

                <CardContent className="pt-0">
                  <Badge className="bg-gray-100 text-gray-700">0 items</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredTags.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Tag className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tags found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Get started by creating your first tag"}
              </p>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!tagToDelete}
        title="Delete Tag"
        description={`Are you sure you want to delete "${tagToDelete?.name}"? This action cannot be undo.`}
        onCancel={() => setTagToDelete(null)}
        onConfirm={async () => {
          if (!tagToDelete) return
          try {
            await api.delete(`/api/tags/${tagToDelete._id}`)
            toast.success("Deleted successfully")
            fetchTags()
          } catch (error) {
            toast.error("Failed to delete")
          } finally {
            setTagToDelete(null)
          }
        }}
        confirmText="Delete"
        cancelText="Cancel"
        />
    </div>
  )
}