"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Slider } from "./ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import toast from "react-hot-toast";
import axios from "axios";

interface Technology {
  _id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  website: string;
  popularity: number;
}

interface EditTechnologyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTechnologyUpdated?: () => void;
  technology: Technology | null;
}

const techCategories = [
  "Frontend Framework",
  "Backend Framework",
  "Full-stack Framework",
  "Programming Language",
  "CSS Framework",
  "UI Library",
  "Backend Runtime",
  "Database",
  "DevOps",
  "Cloud Service",
  "Testing Framework",
  "Build Tool",
  "Package Manager",
  "Version Control",
  "API",
  "Mobile Framework",
  "Desktop Framework",
  "Game Engine",
  "Machine Learning",
  "Blockchain",
];

const techIcons = [
  { value: "⚛️", label: "React (⚛️)" },
  { value: "▲", label: "Next.js (▲)" },
  { value: "🔷", label: "TypeScript (🔷)" },
  { value: "🎨", label: "CSS/Design (🎨)" },
  { value: "🟢", label: "Node.js (🟢)" },
  { value: "🐍", label: "Python (🐍)" },
  { value: "☕", label: "Java (☕)" },
  { value: "🐘", label: "PostgreSQL (🐘)" },
  { value: "🍃", label: "MongoDB (🍃)" },
  { value: "🐳", label: "Docker (🐳)" },
  { value: "☁️", label: "Cloud (☁️)" },
  { value: "🔧", label: "Tools (🔧)" },
  { value: "📱", label: "Mobile (📱)" },
  { value: "🎮", label: "Games (🎮)" },
  { value: "🤖", label: "AI/ML (🤖)" },
  { value: "⚡", label: "Performance (⚡)" },
];

const colorOptions = [
  { value: "bg-blue-100 text-blue-800", label: "Blue", preview: "bg-blue-100" },
  {
    value: "bg-green-100 text-green-800",
    label: "Green",
    preview: "bg-green-100",
  },
  {
    value: "bg-purple-100 text-purple-800",
    label: "Purple",
    preview: "bg-purple-100",
  },
  { value: "bg-cyan-100 text-cyan-800", label: "Cyan", preview: "bg-cyan-100" },
  {
    value: "bg-yellow-100 text-yellow-800",
    label: "Yellow",
    preview: "bg-yellow-100",
  },
  { value: "bg-red-100 text-red-800", label: "Red", preview: "bg-red-100" },
  {
    value: "bg-indigo-100 text-indigo-800",
    label: "Indigo",
    preview: "bg-indigo-100",
  },
  { value: "bg-pink-100 text-pink-800", label: "Pink", preview: "bg-pink-100" },
  { value: "bg-gray-100 text-gray-800", label: "Gray", preview: "bg-gray-100" },
];

export function EditTechnologyModal({
  open,
  onOpenChange,
  onTechnologyUpdated,
  technology,
}: EditTechnologyModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("");
  const [website, setWebsite] = useState("");
  const [popularity, setPopularity] = useState([75]);
  const [loading, setLoading] = useState(false);

  // Populate form when technology changes
  useEffect(() => {
    if (technology) {
      setName(technology.name || "");
      setDescription(technology.description || "");
      setCategory(technology.category || "");
      setIcon(technology.icon || "");
      setColor(technology.color || "");
      setWebsite(technology.website || "");
      setPopularity([technology.popularity || 75]);
    }
  }, [technology]);

  const resetForm = () => {
    if (technology) {
      setName(technology.name || "");
      setDescription(technology.description || "");
      setCategory(technology.category || "");
      setIcon(technology.icon || "");
      setColor(technology.color || "");
      setWebsite(technology.website || "");
      setPopularity([technology.popularity || 75]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!technology) return;

    setLoading(true);

    try {
      const response = await axios.patch(`/api/technology/${technology._id}`, {
        name,
        description,
        category,
        icon,
        color,
        website,
        popularity: popularity[0],
      });

      const updatedTechnology = response.data;

      onOpenChange(false);

      // Refresh the technologies list
      if (onTechnologyUpdated) {
        onTechnologyUpdated();
      }
      toast.success("Technology updated successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update technology";
      console.error(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  if (!technology) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Technology
          </DialogTitle>
          <DialogDescription>
            Update the details for "{technology.name}".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Technology Name *
            </Label>
            <Input
              id="name"
              placeholder="e.g., React, Node.js, PostgreSQL"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of the technology..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category *</Label>
            <Select
              value={category}
              onValueChange={setCategory}
              required
              disabled={loading}
            >
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {techCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Icon */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Icon</Label>
              <Select value={icon} onValueChange={setIcon} disabled={loading}>
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {techIcons.map((iconOption) => (
                    <SelectItem key={iconOption.value} value={iconOption.value}>
                      {iconOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Color Theme</Label>
              <Select value={color} onValueChange={setColor} disabled={loading}>
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((colorOption) => (
                    <SelectItem
                      key={colorOption.value}
                      value={colorOption.value}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded ${colorOption.preview}`}
                        ></div>
                        {colorOption.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website" className="text-sm font-medium">
              Official Website
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={loading}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

          {/* Popularity */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Popularity Score: {popularity[0]}%
            </Label>
            <Slider
              value={popularity}
              onValueChange={setPopularity}
              max={100}
              min={0}
              step={5}
              className="w-full"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Preview */}
          {(name || icon || color) && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl flex-shrink-0">{icon || "🔧"}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 break-words leading-tight">
                      {name || "Technology Name"}
                    </h3>
                    <p className="text-sm text-gray-500 break-words">
                      {category || "Category"}
                    </p>
                  </div>
                </div>
                {description && (
                  <p className="text-sm text-gray-600 mb-3">{description}</p>
                )}
                <div className="flex items-center justify-between">
                  {color && (
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${color}`}
                    >
                      0 projects
                    </span>
                  )}
                  <div className="text-sm text-gray-600">
                    Popularity: {popularity[0]}%
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="border-gray-200 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {loading ? "Updating..." : "Update Technology"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
