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
import { useRouter } from 'next/navigation';
import { formatDate, getStatusColor } from '@/lib/utils';

export default function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const id = parseInt(params.id, 10);

  const fetchSubmission = async () => {
    try {
      const data = await submissionsApi.getSubmission(id);
      setSubmission(data);
      
      // If the submission is completed or failed, clear the refresh interval
      if (data.status === SubmissionStatus.COMPLETED || data.status === SubmissionStatus.FAILED) {
        if (refreshInterval) {
          clearInterval(refreshInterval);
          setRefreshInterval(null);
        }
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to load submission details',
        variant: 'destructive',
      });
      
      // Clear the refresh interval on error
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
    
    // Set up a refresh interval for pending or processing submissions
    const interval = setInterval(() => {
      if (submission?.status === SubmissionStatus.PENDING || submission?.status === SubmissionStatus.PROCESSING) {
        fetchSubmission();
      }
    }, 5000); // Refresh every 5 seconds
    
    setRefreshInterval(interval);
    
    // Cleanup interval on unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper function to get status label with color
  const getStatusLabel = (status: SubmissionStatus) => {
    const colorClass = getStatusColor(status);
    return (
      <span className={`px-2 py-1 rounded text-white text-xs ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Render the feedback based on submission status
  const renderFeedback = () => {
    if (!submission) return null;

    switch (submission.status) {
      case SubmissionStatus.PENDING:
        return (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-blue-200 mr-3"></div>
            <p className="text-gray-500">Your CV is in queue for analysis...</p>
          </div>
        );
      
      case SubmissionStatus.PROCESSING:
        return (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-blue-200 mr-3"></div>
            <p className="text-gray-500">AI is analyzing your CV...</p>
          </div>
        );
      
      case SubmissionStatus.COMPLETED:
        if (!submission.feedback) {
          return <p className="text-gray-500 py-4">No feedback available.</p>;
        }
        
        return (
          <div className="space-y-4 py-4">
            <div className="flex items-center">
              <div className="w-24 font-medium text-gray-700">Score:</div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-blue-600">{submission.score?.toFixed(1) || 'N/A'}</span>
                <span className="text-gray-500 ml-1">/10</span>
              </div>
            </div>
            
            <div>
              <div className="font-medium text-gray-700 mb-2">Feedback:</div>
              <div className="bg-gray-50 rounded-md p-4 whitespace-pre-wrap text-gray-800">
                {submission.feedback}
              </div>
            </div>
          </div>
        );
      
      case SubmissionStatus.FAILED:
        return (
          <div className="bg-red-50 rounded-md p-4 my-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Analysis failed</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{submission.feedback || 'There was an error analyzing your CV. Please try uploading again.'}</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <p className="text-gray-500 py-4">No feedback available.</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">CV Analysis Results</h1>
            <div className="space-x-3">
              <Link href="/submissions">
                <Button variant="outline">Back to Submissions</Button>
              </Link>
              <Link href="/upload">
                <Button>Upload New CV</Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-blue-200"></div>
              <p className="mt-2 text-gray-500">Loading submission details...</p>
            </div>
          ) : !submission ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No submission found</h3>
                  <p className="mt-1 text-sm text-gray-500">This submission might have been deleted or doesn't exist.</p>
                  <div className="mt-6">
                    <Link href="/submissions">
                      <Button>View All Submissions</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Submission Details</CardTitle>
                  <CardDescription>Information about your CV submission</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Filename</dt>
                      <dd className="mt-1 text-sm text-gray-900">{submission.original_filename}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">{getStatusLabel(submission.status)}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Submitted On</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(submission.submitted_at)}</dd>
                    </div>
                    {submission.completed_at && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Completed On</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(submission.completed_at)}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>AI-powered feedback on your CV</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderFeedback()}
                </CardContent>
              </Card>

              {/* Recommendations for submission score (if completed) */}
              {submission.status === SubmissionStatus.COMPLETED && submission.score !== null && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>What's Next?</CardTitle>
                    <CardDescription>Based on your analysis results</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {submission.score >= 8 ? (
                        <div className="bg-green-50 rounded-md p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-green-800">Great CV!</h3>
                              <div className="mt-2 text-sm text-green-700">
                                <p>Your CV is well-structured and contains strong content. You're ready to start applying for jobs!</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : submission.score >= 6 ? (
                        <div className="bg-blue-50 rounded-md p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-blue-800">Good CV with room for improvement</h3>
                              <div className="mt-2 text-sm text-blue-700">
                                <p>Your CV is solid but could benefit from addressing the feedback above. Consider focusing on quantifiable achievements and tailoring your CV to specific job roles.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 rounded-md p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-yellow-800">Needs significant improvement</h3>
                              <div className="mt-2 text-sm text-yellow-700">
                                <p>Based on the analysis, your CV needs substantial work. Consider revising it by following the feedback provided, focusing on structure, content, and formatting.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Next Steps:</h4>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                          <li>Review the detailed feedback and make the suggested improvements</li>
                          <li>Upload a revised version of your CV for another analysis</li>
                          <li>Compare scores to track your progress</li>
                        </ul>
                      </div>

                      <div className="mt-6 flex space-x-3">
                        <Link href="/upload">
                          <Button>Upload Revised CV</Button>
                        </Link>
                        <Link href="/dashboard">
                          <Button variant="outline">Back to Dashboard</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}