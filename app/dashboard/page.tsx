'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { submissionsApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { SubmissionStats, Submission, SubmissionStatus } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats and recent submissions
        const [statsData, submissionsData] = await Promise.all([
          submissionsApi.getStats(),
          submissionsApi.getSubmissions(),
        ]);

        setStats(statsData);
        setRecentSubmissions(submissionsData.slice(0, 5)); // Get only the 5 most recent
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div className="space-x-3">
              <Link href="/upload">
                <Button>Upload CV</Button>
              </Link>
              <Link href="/credits">
                <Button variant="outline">Buy Credits</Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-blue-200"></div>
              <p className="mt-2 text-gray-500">Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Available Credits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user?.credits || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Submissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.total_submissions || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Completed Analyses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.status_counts?.[SubmissionStatus.COMPLETED] || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats?.average_score ? stats.average_score.toFixed(1) : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Submissions */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                  <CardDescription>Your most recent CV analyses</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentSubmissions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Filename
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Score
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentSubmissions.map((submission) => (
                            <tr key={submission.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {submission.original_filename}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(submission.submitted_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {getStatusLabel(submission.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {submission.status === SubmissionStatus.COMPLETED && submission.score
                                  ? submission.score.toFixed(1)
                                  : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link href={`/submissions/${submission.id}`}>
                                  <Button variant="link" className="text-blue-600">View</Button>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No submissions yet. Upload your CV to get started.
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Link href="/submissions">
                    <Button variant="outline">View All Submissions</Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload a CV</CardTitle>
                    <CardDescription>Upload a new CV for analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Submit your CV for AI-powered analysis and get detailed feedback.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/upload" className="w-full">
                      <Button className="w-full">Upload CV</Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Purchase Credits</CardTitle>
                    <CardDescription>Buy credits to analyze more CVs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Choose from our different credit packages to continue using our service.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/credits" className="w-full">
                      <Button variant="outline" className="w-full">Get Credits</Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>View All Submissions</CardTitle>
                    <CardDescription>Access your complete submission history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Review all your past CV submissions and their analysis results.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/submissions" className="w-full">
                      <Button variant="outline" className="w-full">View History</Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}