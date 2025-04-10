'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { cvApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

export default function UploadPage() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a CV file to upload',
        variant: 'destructive',
      });
      return;
    }

    // Check file type
    const allowedTypes = ['.pdf', '.docx', '.doc', '.txt', '.md'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: 'Invalid file type',
        description: `Allowed file types: ${allowedTypes.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    // Check credits
    if (!user || user.credits < 1) {
      toast({
        title: 'Insufficient credits',
        description: 'You need at least 1 credit to analyze a CV',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const result = await cvApi.uploadCV(selectedFile);
      
      toast({
        title: 'Upload successful',
        description: 'Your CV has been submitted for analysis',
        variant: 'success',
      });
      
      // Redirect to the submission details page
      router.push(`/submissions/${result.id}`);
    } catch (error) {
      console.error('Upload error:', error);
      
      // Handle specific error cases
      let errorMessage = 'An unexpected error occurred';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as any).response;
        if (response?.status === 402) {
          errorMessage = 'Not enough credits to analyze this CV';
        } else if (response?.data?.detail) {
          errorMessage = response.data.detail;
        }
      }
      
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Upload CV for Analysis</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>CV Analysis</CardTitle>
              <CardDescription>
                Upload your CV document to receive AI-powered feedback and scoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center transition-colors ${
                  dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <div className="mt-4 flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt,.md"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, TXT or MD up to 10MB
                  </p>
                </div>
                
                {selectedFile && (
                  <div className="mt-4 p-2 bg-blue-50 rounded-md text-blue-700 flex items-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 mr-2" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    <span className="text-sm">{selectedFile.name}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Credit Required</h3>
                    <p className="text-sm text-gray-500">1 credit per CV analysis</p>
                  </div>
                  <div className="text-sm font-medium">
                    Your Balance: <span className="text-blue-600">{user?.credits || 0} credits</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                {uploading ? 'Uploading...' : 'Upload and Analyze'}
              </Button>
            </CardFooter>
          </Card>
          
          {(!user || user.credits < 1) && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-yellow-400" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Insufficient Credits</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        You don't have enough credits to analyze a CV. Purchase credits to continue.
                      </p>
                    </div>
                    <div className="mt-4">
                      <Link href="/credits">
                        <Button size="sm" variant="outline" className="text-yellow-800 bg-yellow-100 border-yellow-300 hover:bg-yellow-200">
                          Purchase Credits
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}