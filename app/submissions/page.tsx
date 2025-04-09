'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { submissionsApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/ui/use-toast';
import { Submission, SubmissionStatus } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';

export default function SubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await submissionsApi.getSubmissions();
        setSubmissions(data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load submissions',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [toast]);

  // Filter submissions by status
  const filteredSubmissions = statusFilter === 'all'
    ? submissions
    : submissions.filter(submission => submission.status === statusFilter);

  // Helper function to get status label with color
  const getStatusLabel = (status: SubmissionStatus) => {
    const colorClass = getStatusColor(status);
    return (
      <span className={`px-2 py-1 rounded text-white text-xs ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">CV Submissions</h1>
            <Link href="/upload">
              <Button>Upload New CV</Button>
            </Link>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter Submissions</CardTitle>
              <CardDescription>View your submissions by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  className="text-sm"
                >
                  All
                </Button>
                {Object.values(SubmissionStatus).map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    onClick={() => setStatusFilter(status)}
                    className="text-sm"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-blue-200"></div>
              <p className="mt-2 text-gray-500">Loading submissions...</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {filteredSubmissions.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {filteredSubmissions.map((submission) => (
                    <li key={submission.id}>
                      <Link href={`/submissions/${submission.id}`}>
                        <div className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="truncate">
                                <div className="flex text-sm">
                                  <p className="font-medium text-blue-600 truncate">{submission.original_filename}</p>
                                </div>
                                <div className="mt-2 flex">
                                  <div className="flex items-center text-sm text-gray-500">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <span>Submitted {formatDate(submission.submitted_at)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <div>
                                  {getStatusLabel(submission.status)}
                                </div>
                                {submission.status === SubmissionStatus.COMPLETED && submission.score !== null && (
                                  <div className="mt-2 flex items-center text-sm">
                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Score: {submission.score.toFixed(1)}/10
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {submissions.length === 0 
                    ? "You haven't submitted any CVs for analysis yet." 
                    : "No submissions match the selected filter."}
                </div>
              )}
            </div>
          )}

          {submissions.length === 0 && !loading && (
            <div className="text-center mt-6">
              <p className="text-gray-500 mb-4">Upload a CV to get started with our AI-powered analysis</p>
              <Link href="/upload">
                <Button>Upload Your First CV</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}