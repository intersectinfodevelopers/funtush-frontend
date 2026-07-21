'use client';

import {useState} from 'react';
import {Crown, X} from 'lucide-react';

interface SubscriptionBannerProps{
    tier?: 'free' | 'medium' | 'large';
    onUpgrade?: () => void;
}

export default function SubscriptionBanner({
    tier = 'free',
    onUpgrade
}: SubscriptionBannerProps){
    const [isVisible, setIsVisible] = useState(true);

    //only show for free tier
    if(tier !== 'free' || !isVisible) return null;
    return (
        <div className='mx-3 mb-2 p-3 bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-lg relative'>
            <button onClick={() => setIsVisible(false)}
                className='absolute top-1 right-1 text-blue-400 hover:text-blue-600 transition-colors'>
                    <X size={16}/>
                </button>
            <div className='flex items-start gap-2'>
                <Crown size={18} className='text-blue-600 mt-0.5 shrink-0'/>
                <div className='flex-1'>
                    <p className='text-sm font-medium text-blue-800'>Upgrade to unlock more feature</p>
                    <button onClick={onUpgrade}
                    className='mt-2 bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors'>
                        View Plans
                    </button>
                </div>
            </div>
        </div>
    );
}