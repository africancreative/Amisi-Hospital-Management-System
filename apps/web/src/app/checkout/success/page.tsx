import { Suspense } from 'react';
import CheckoutSuccessPage from '../../_components/CheckoutSuccessPage';
export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#07070a] flex items-center justify-center"><p className="text-white">Loading...</p></div>}>
            <CheckoutSuccessPage />
        </Suspense>
    );
}
