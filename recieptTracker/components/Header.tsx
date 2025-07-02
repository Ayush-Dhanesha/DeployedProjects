"use client"
import { Button } from '@/components/ui/button'
import React from 'react'
import Link from 'next/link'
import { Shield } from 'lucide-react'
import { SignedIn, SignInButton, SignedOut, UserButton } from '@clerk/clerk-react'
import { usePathname } from 'next/navigation'

function Header() {

    const pathname = usePathname()
    const isHomePage = pathname === '/'
    return (

    <div className={`flex justify-between items-center p-4 ${
        isHomePage ? 'bg-blue-50' : 'bg-white border-b border-slate-200 dark:border-slate-800'
    }`}>
        <Link href="/" className='flex items-center'>
            <Shield className='w-6 h-6 text-blue-600 mr-2'/>
            <h1 className='text-xl font-bold text-blue-600'>RecieptIO</h1>
        </Link>

        <div className='flex items-center'>

            <SignedIn>
                <Link href="/reciepts" className='mr-4'>
                    <Button variant="outline" className='bg-blue-600 text-white hover:bg-blue-700'>My Receipts</Button>
                </Link>
                <Link href="/manage-plan" className='mr-4'>
                    <Button>Manage Plans</Button>
                </Link>
                <UserButton />
            </SignedIn>

            <SignedOut>
                <SignInButton>
                    <Button>Login</Button>
                </SignInButton>
            </SignedOut>
        </div>
    </div>
  )
}

export default Header