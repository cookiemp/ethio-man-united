'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { useFirebase } from '@/firebase';
import { uploadImage, validateImageFile, generateImageFilename } from '@/lib/storage';
import Image from 'next/image';

export default function CreateNewsArticlePage() {
  const router = useRouter();
  const { firebaseApp } = useFirebase();
  
  const [formData, setFormData] = useState({
    headline: '',
    content: '',
    author: 'Admin',
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file');
      return;
    }

    setSelectedImage(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setThumbnailUrl('');
  };

  // Upload image to Firebase Storage
  const handleUploadImage = async () => {
    if (!selectedImage || !firebaseApp) return;

    setIsUploading(true);
    setError('');

    try {
      const filename = generateImageFilename(selectedImage.name);
      const path = `news-images/${filename}`;
      
      const downloadURL = await uploadImage(firebaseApp, selectedImage, path);
      setThumbnailUrl(downloadURL);
      setSuccess('Image uploaded successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/news/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          thumbnailUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('News article created successfully!');
        // Redirect to news list after 1.5 seconds
        setTimeout(() => {
          router.push('/admin/news');
        }, 1500);
      } else {
        setError(data.error || 'Failed to create news article');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/news">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline">Create News Article</h1>
          <p className="text-muted-foreground">Add a new article to the news section</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
          <CardDescription>
            Fill in the details below to create a new news article
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="bg-green-50 text-green-900 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Headline */}
            <div className="space-y-2">
              <Label htmlFor="headline">Headline *</Label>
              <Input
                id="headline"
                name="headline"
                type="text"
                placeholder="Enter article headline"
                value={formData.headline}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="text-lg font-semibold"
              />
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                name="author"
                type="text"
                placeholder="Author name"
                value={formData.author}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            {/* Thumbnail Image */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail Image</Label>
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <Label
                    htmlFor="image-upload"
                    className="cursor-pointer text-primary hover:underline"
                  >
                    Click to upload an image
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isSubmitting || isUploading}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    PNG, JPG, WebP or GIF (max. 5MB)<br />
                    <span className="text-xs">Recommended: 1200x675px (16:9 aspect ratio)</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-gray-100">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      style={{ objectFit: 'contain' }}
                      className="bg-gray-50"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                      disabled={isSubmitting || isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {!thumbnailUrl && (
                    <Button
                      type="button"
                      onClick={handleUploadImage}
                      disabled={isUploading || isSubmitting}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                        </>
                      )}
                    </Button>
                  )}
                  {thumbnailUrl && (
                    <p className="text-sm text-green-600">✓ Image uploaded successfully</p>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Article Content *</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your article content here..."
                value={formData.content}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                rows={15}
                className="font-body"
              />
              <p className="text-sm text-muted-foreground">
                {formData.content.length} characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 justify-end">
              <Link href="/admin/news">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Article'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
