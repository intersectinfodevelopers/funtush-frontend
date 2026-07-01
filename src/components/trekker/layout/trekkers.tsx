'use client';
import Link from 'next/link';                    
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LogOut, User } from 'lucide-react';     

import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils/cn';

import { useState, useEffect } from 'react';
import { getReadNotificationIds } from '@/lib/auth';

const NAV_LINKS = [
    {label: 'MY Treks ', href : ROUTES.TREKKER.MY_TREKS},
    {label: 'Profile', href: ROUTES.TREKKER.PROFILE},
    {label: 'Notifications', href: '/notifications',key: 'notifications' as const},
];


const TOTAL_NOTIFICATIONS =5 ;

export function TrekkerTopbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const readIds = getReadNotificationIds();
      setUnreadCount(Math.max(0, TOTAL_NOTIFICATIONS - readIds.length));
    };

    updateCount();

    window.addEventListener('focus', updateCount);
    return () => window.removeEventListener('focus', updateCount);
  }, [pathname]);


    return(
        <header className='sticky top-0 z-50 border-b border-neutral-200 bg-white '>
            <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
                <Link href={ROUTES.TREKKER.MY_TREKS} className="flex items-center gap-2">
                <Image 
                src="/funtush-logo.png"
                alt='funtush'
                width={120}
                height={36}
                priority className="h-10 w-auto object-contain"/>
                </Link>

                <nav className='hidden items-center gap-6 md:flex'>
                       {NAV_LINKS.map((link) => {
                        const isActive = pathname.startsWith(link.href);
                        const showBadge = link.key === 'notifications' && unreadCount > 0;
                        


                        return (
                         <Link
                         key={link.href}
                         href={link.href}
                         className={cn(
                            'relative inline-flex item-center gap-1.5 text-sm font-medium transition-colors'
                         , isActive
                         ? 'text-primary-600'
                         : 'text-neutral-600 hover:text-neutral-900'
                         )} >
                             {link.label}
                             {showBadge && (
                                <span className="inline-flex h-4 min-w-16px items-center justify-center rounded-full bg-red-500
                                 px-1.5 text-[10px] font-semibold text-white">
                                    {unreadCount}
                                </span>
                             )}
                         </Link>
                        );
                    })}
                </nav>

                <div className='flex items-center gap-3'>

                <div className='hidden items-center gap-2 sm:flex'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary-100'>
                        <User className="h-4 w-4 text-primary-600" />
                    </div>
                    <span className='text-sm font-medium text-neutral-700'>
                        {user?.name ?? 'Guest'}
                    </span>
                </div>

                <button onClick={logout}
                className='flex items-center gap-1.5 rounded-lg border border-netural-300 px-3
                py-1.5 text-sm font-meduim text-netural-700 transition hover:bg-netural-50'
                aria-label='Logout'>
                    <LogOut className='h-4 w-4 '/>
                    <span className='hidden sm:inline'>Logout</span>
                </button>

                </div>





            </div>
        </header>
    );

}