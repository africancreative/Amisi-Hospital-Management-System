import { Suspense } from 'react';
import CheckoutPage from '../_components/CheckoutPage';

export default function Page() { 
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#07070a] flex items-center justify-center"><p className="text-white">Loading Secure Checkout...</p></div>}>
            <CheckoutPage />
        </Suspense>
    ); 
}
