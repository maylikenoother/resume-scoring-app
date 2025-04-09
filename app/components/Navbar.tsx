import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-blue-600">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                Improve Your CV with AI-Powered Analysis
              </h1>
              <p className="mt-6 max-w-lg mx-auto text-xl text-blue-100">
                Get detailed feedback, scoring, and suggestions to make your CV stand out to employers.
              </p>
              <div className="mt-10">
                <Link href="/register">
                  <Button className="px-8 py-6 text-lg bg-white text-blue-600 hover:bg-blue-50">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
                Features
              </h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Everything you need to perfect your CV
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Our AI-powered platform provides comprehensive analysis and feedback on your CV.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 text-white bg-blue-500 rounded-md mx-auto flex items-center justify-center text-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">AI-Powered Analysis</h3>
                  <p className="mt-2 text-gray-500">
                    Our advanced AI analyzes your CV for structure, content, and impact, providing detailed feedback.
                  </p>
                </div>

                <div className="border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 text-white bg-blue-500 rounded-md mx-auto flex items-center justify-center text-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Comprehensive Scoring</h3>
                  <p className="mt-2 text-gray-500">
                    Receive a detailed score breakdown across multiple dimensions to identify strengths and weaknesses.
                  </p>
                </div>

                <div className="border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 text-white bg-blue-500 rounded-md mx-auto flex items-center justify-center text-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Actionable Recommendations</h3>
                  <p className="mt-2 text-gray-500">
                    Get specific, actionable suggestions to improve your CV and increase your chances of landing interviews.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                How It Works
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Get your CV analyzed in three simple steps.
              </p>
            </div>

            <div className="mt-12">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="h-12 w-12 text-white bg-blue-600 rounded-full mx-auto flex items-center justify-center text-xl font-bold">
                    1
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Upload your CV</h3>
                  <p className="mt-2 text-gray-500">
                    Upload your CV in any common format (PDF, DOCX, TXT).
                  </p>
                </div>

                <div className="text-center">
                  <div className="h-12 w-12 text-white bg-blue-600 rounded-full mx-auto flex items-center justify-center text-xl font-bold">
                    2
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">AI Analysis</h3>
                  <p className="mt-2 text-gray-500">
                    Our AI analyzes your CV for content, structure, and impact.
                  </p>
                </div>

                <div className="text-center">
                  <div className="h-12 w-12 text-white bg-blue-600 rounded-full mx-auto flex items-center justify-center text-xl font-bold">
                    3
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Get Results</h3>
                  <p className="mt-2 text-gray-500">
                    Receive detailed feedback and actionable recommendations.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-16 text-center">
              <Link href="/register">
                <Button size="lg" className="px-6">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">CV Scoring App</h3>
              <p className="text-gray-400 mt-2">Powered by AI to help you land your dream job</p>
            </div>
            <div className="text-right text-gray-400">
              &copy; {new Date().getFullYear()} CV Scoring App. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}