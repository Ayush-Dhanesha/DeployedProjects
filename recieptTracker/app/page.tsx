"use client";

import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { features } from "process";
import PdfDropZone from "@/components/PdfDropZone";
import { ArrowRight, ArrowRightCircle, ArrowRightFromLine, BookOpen, Cloud, CloudHail, FolderSync, MapPinnedIcon, ScanText, Server, TrainTrack } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-100 py-20 md:py-28">
        <div className="container px-4 md:px-6 mx-auto ">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl lg:text-6xl sm:text-4xl tracking-tighter font-bold text-gray-900">
                Intelligent Receipt Management. 
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                <b>RecieptIO</b> is your ultimate solution for effortless receipt tracking and expense management.
                Effortlessly track and manage your receipts with <b>RecieptIO</b>, Save time and gain Insight from your expenses.
              </p>

            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Link href="/reciepts" className="w-full sm:w-auto">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Get Started <ArrowRight className="inline-block ml-2 w-4 h-4" />
                </button>
              </Link>
              <Link href="/manage-plan" className="w-full sm:w-auto">
                <button className="px-6 py-3 border bg-border-gray-300 text-white-700 rounded-md hover:bg-gray-200 transition-colors">
                  View Pricing 😎
                </button>
              </Link>
            </div>
          </div>

        </div>
        { /* Pdf drop-Zone */}
        <div className="container mx-auto mt-12">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-200 transition-colors">
            <div className="flex flex-col items-center space-y-4">
              <PdfDropZone />
            </div>
          </div>
        </div>
      </section>
      
      { /*features*/}
      <section className="py-20 bg-white bg-gradient-to-b from-blue-100">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose RecieptIO?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <ScanText className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Smart Receipt Scanning</h3>
              <p className="text-gray-600">
                Automatically extract key information from your receipts using advanced OCR technology.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <TrainTrack className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Expense Tracking</h3>
              <p className="text-gray-600">
                Keep track of your expenses effortlessly with categorized reports and insights.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <Cloud className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Secure Cloud Storage</h3>
              <p className="text-gray-600">
                Store your receipts securely in the cloud, accessible anytime, anywhere.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <FolderSync className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Multi-Device Sync</h3>
              <p className="text-gray-600">
                Access your receipts and expenses seamlessly across all your devices.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <BookOpen className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Intelligent Insights</h3>
              <p className="text-gray-600">
                Gain valuable insights into your spending habits with our AI-powered analytics.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <Server className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">24/7 Support</h3>
              <p className="text-gray-600">
                Our dedicated support team is here to assist you with any questions or issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      { /*Pricing*/}
      <section className="py-20 bg-gray-50 bg-gradient-to-b from-blue-100">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Flexible Pricing Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">  
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Free Plan</h3>
              <p className="text-gray-600 mb-4">Perfect for individuals just getting started.</p>
              <ul className="list-disc list-inside mb-4">
                <li>Up to 50 receipts per month</li>
                <li>Basic OCR scanning</li>
                <li>Cloud storage</li>
              </ul>
              <Link href="/manage-plan">
                <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Choose Free Plan
                </button>
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Jackpot Plan</h3>
              <p className="text-gray-600 mb-4">Ideal for small businesses and freelancers.</p>
              <ul className="list-disc list-inside mb-4">
                <li>Up to 500 receipts per month</li>
                <li>Advanced OCR scanning</li>
                <li>Expense tracking and insights</li>
                <li>Priority support</li>
              </ul>
              <Link href="/manage-plan">
                <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Choose Jackpot Plan
                </button>
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Pro Plan</h3>
              <p className="text-gray-600 mb-4">Custom solutions for large organizations.</p>
              <ul className="list-disc list-inside mb-4">
                <li>Unlimited receipts</li>
                <li>Custom OCR solutions</li>
                <li>Advanced analytics and reporting</li>
                <li>Dedicated account manager</li>
              </ul>
              <Link href="/manage-plan">
                <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Choose pro Plan
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>


      { /*Info*/}
      <section className="py-20 bg-white bg-gradient-to-b from-blue-100">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Get Started with RecieptIO Today!
          </h2>
          <div className="flex justify-center space-x-4">
            <Link href="/receipts" className="w-full sm:w-auto">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Start Tracking Receipts
              </button>
            </Link>
          </div>
        </div>
      </section>


      { /*Footer*/}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-sm mb-2">&copy; {new Date().getFullYear()} RecieptIO. All rights reserved.</p>
          <p className="text-sm">Built with ❤️ by the RecieptIO Team</p>
        </div>
      </footer>
    </div>
  );
}


