"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, X, Loader2, Image as ImageIcon, Camera, Sparkles, Link2, CloudUpload } from "lucide-react"
import Image from "next/image"
import { uploadImage } from "@/lib/storage"

interface ImageUploadProps {
  currentImageUrl?: string
  onImageUploaded: (url: string) => void
  onImageRemoved?: () => void
  folder?: string
  className?: string
}

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  folder = "menu-items",
  className = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(true) // Show URL input by default as fallback
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync previewUrl when currentImageUrl prop changes (e.g., when editing different items)
  useEffect(() => {
    setPreviewUrl(currentImageUrl || null)
  }, [currentImageUrl])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, WebP, or GIF)")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB")
      return
    }

    setError(null)
    setIsUploading(true)

    // Show preview immediately
    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)

    try {
      const uploadedUrl = await uploadImage(file, folder)
      
      if (uploadedUrl) {
        setPreviewUrl(uploadedUrl)
        onImageUploaded(uploadedUrl)
      } else {
        setError("Failed to upload image. Please try again.")
        setPreviewUrl(currentImageUrl || null)
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError("Failed to upload image. Please try again.")
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setIsUploading(false)
      // Cleanup the local preview URL
      URL.revokeObjectURL(localPreview)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onImageRemoved?.()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file && fileInputRef.current) {
      // Create a DataTransfer to set the files
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      fileInputRef.current.files = dataTransfer.files
      
      // Trigger the change event
      const event = new Event("change", { bubbles: true })
      fileInputRef.current.dispatchEvent(event)
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        id="image-upload"
      />

      {previewUrl ? (
        <div className="relative group">
          {/* Preview Container */}
          <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-slate-700/50 bg-slate-800/50">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Upload Progress Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-shawarma/20 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-shawarma border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-white text-sm font-medium mt-4">Uploading...</p>
              </div>
            )}
            
            {/* Success Badge */}
            {!isUploading && (
              <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-sm rounded-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-white text-xs font-semibold">Image Ready</span>
              </div>
            )}
            
            {/* Remove Button */}
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-3 right-3 p-2.5 bg-red-500/90 backdrop-blur-sm text-white rounded-xl hover:bg-red-600 transition-all shadow-lg opacity-0 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
            
            {/* Change Image Button */}
            <label
              htmlFor="image-upload"
              className="absolute bottom-3 right-3 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all cursor-pointer flex items-center gap-2 opacity-0 group-hover:opacity-100 border border-white/20"
            >
              <Camera className="h-4 w-4" />
              <span className="text-sm font-medium">Change</span>
            </label>
          </div>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all overflow-hidden ${
            isDragging 
              ? "border-shawarma bg-shawarma/10" 
              : "border-slate-600 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-500"
          }`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          {isUploading ? (
            <div className="flex flex-col items-center relative z-10">
              <div className="relative">
                <div className="w-14 h-14 border-4 border-shawarma/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-14 h-14 border-4 border-shawarma border-t-transparent rounded-full animate-spin"></div>
              </div>
              <span className="text-sm text-slate-400 mt-4 font-medium">Uploading your image...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center relative z-10">
              {/* Icon */}
              <div className={`relative mb-4 ${isDragging ? "scale-110" : ""} transition-transform`}>
                <div className="absolute -inset-3 bg-gradient-to-r from-shawarma to-orange-500 rounded-2xl opacity-20 blur-xl"></div>
                <div className="relative p-4 bg-gradient-to-br from-shawarma to-orange-600 rounded-2xl shadow-lg shadow-shawarma/30">
                  <CloudUpload className="h-8 w-8 text-white" />
                </div>
              </div>
              
              {/* Text */}
              <p className="text-base font-semibold text-white mb-1">
                {isDragging ? "Drop your image here" : "Upload Image"}
              </p>
              <p className="text-sm text-slate-400">
                Drag & drop or <span className="text-shawarma font-medium">browse</span>
              </p>
              <p className="text-xs text-slate-500 mt-2">JPG, PNG, WebP or GIF • Max 5MB</p>
            </div>
          )}
        </label>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400 font-medium">{error}</p>
          </div>
          <p className="text-xs text-slate-400">
            💡 Tip: Use "paste image URL" below to add images from the web instead.
          </p>
        </div>
      )}

      {/* URL Input Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5" />
            Paste image URL
          </span>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-xs text-shawarma hover:text-orange-400 transition-colors"
          >
            {showUrlInput ? "Hide" : "Show"}
          </button>
        </div>

        {/* Manual URL input */}
        {showUrlInput && (
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <ImageIcon className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={previewUrl || ""}
              onChange={(e) => {
                const url = e.target.value
                setPreviewUrl(url)
                if (url) onImageUploaded(url)
              }}
              className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-shawarma/50 focus:border-shawarma/50 transition-all"
            />
            <p className="text-xs text-slate-500 mt-1.5 pl-1">
              Use images from Unsplash, Google, or any public URL
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
