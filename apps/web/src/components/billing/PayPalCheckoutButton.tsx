'use client';

import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PayPalCheckoutButtonProps {
    financialRecordId: string;
    tenantId: string;
    amountToPay: string; // Used mostly for UI/display
    onSuccess?: (details: any) => void;
    onError?: (error: any) => void;
}

export function PayPalCheckoutButton({
    financialRecordId,
    tenantId,
    amountToPay,
    onSuccess,
    onError
}: PayPalCheckoutButtonProps) {
    const [isPending, setIsPending] = useState(false);
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

    if (!clientId) {
        return <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md">PayPal is not configured correctly. Missing Client ID.</div>;
    }

    return (
        <PayPalScriptProvider options={{ 
            clientId: clientId, 
            currency: 'USD',
            intent: 'capture' 
        }}>
            <div className="w-full max-w-md mx-auto">
                {isPending && <p className="text-sm text-neutral-500 mb-2">Processing...</p>}
                
                <h3 className="text-lg font-semibold text-white mb-4">Pay ${amountToPay} via PayPal</h3>
                
                <PayPalButtons
                    style={{ layout: 'vertical', shape: 'pill' }}
                    createOrder={async () => {
                        try {
                            const response = await fetch('/api/paypal/create-order', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    financialRecordId,
                                    tenantId,
                                }),
                            });
                            
                            const orderData = await response.json();
                            
                            if (orderData.id) {
                                return orderData.id;
                            } else {
                                const errorDetail = orderData?.details?.[0];
                                const errorMessage = errorDetail ? 
                                    `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})` : 
                                    JSON.stringify(orderData);

                                throw new Error(errorMessage);
                            }
                        } catch (error) {
                            console.error('Failed to create order', error);
                            if (onError) onError(error);
                            throw error;
                        }
                    }}
                    onApprove={async (data, actions) => {
                        try {
                            setIsPending(true);
                            const response = await fetch('/api/paypal/capture-order', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    orderID: data.orderID,
                                    financialRecordId,
                                    tenantId,
                                }),
                            });

                            const orderData = await response.json();
                            
                            const errorDetail = orderData?.details?.[0];

                            if (errorDetail?.issue === 'INSTRUMENT_DECLINED') {
                                // Recoverable error
                                if (actions && actions.restart) {
                                  return actions.restart();
                                }
                            } else if (errorDetail) {
                                throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
                            } else {
                                // Success!
                                if (onSuccess) onSuccess(orderData);
                            }
                        } catch (error) {
                            console.error('Failed to capture order', error);
                            if (onError) onError(error);
                        } finally {
                            setIsPending(false);
                        }
                    }}
                />
            </div>
        </PayPalScriptProvider>
    );
}
