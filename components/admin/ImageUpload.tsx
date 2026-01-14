"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
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
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
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
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        id="image-upload"
      />

      {previewUrl ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-2" />
              <span className="text-sm text-gray-500">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="p-3 bg-gray-200 rounded-full mb-3">
                <Upload className="h-6 w-6 text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP or GIF (max 5MB)</p>
            </div>
          )}
        </label>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <X className="h-4 w-4" />
          {error}
        </p>
      )}

      {/* Manual URL input as fallback */}
      <div className="flex items-center gap-2 pt-2">
        <ImageIcon className="h-4 w-4 text-gray-400" />
        <input
          type="url"
          placeholder="Or paste image URL..."
          value={previewUrl || ""}
          onChange={(e) => {
            const url = e.target.value
            setPreviewUrl(url)
            if (url) onImageUploaded(url)
          }}
          className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/20"
        />
      </div>
    </div>
  )
}
