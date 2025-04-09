'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { creditsApi, userApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditTransaction, PricingTiers, TransactionType } from '@/types';

export default function CreditsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [pricingTiers, setPricingTiers] = useState<PricingTiers>({});
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricingData, transactionsData] = await Promise.all([
          creditsApi.getPricing(),
          userApi.getTransactions(),
        ]);
        
        setPricingTiers(pricingData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error loading credits data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load credits data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handlePurchaseCredits = async (tier: string) => {
    setSelectedTier(tier);
    setPurchasing(true);

    try {
      const result = await creditsApi.purchaseCredits(tier);
      
      // Update the transactions list and refresh user data
      setTransactions([result, ...transactions]);
      await refreshUser();
      
      toast({
        title: 'Purchase successful',
        description: `You've successfully purchased ${pricingTiers[tier].amount} credits`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Error purchasing credits:', error);
      toast({
        title: 'Purchase failed',
        description: 'There was an error processing your purchase',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(false);
      setSelectedTier(null);
    }
  };

  // Helper to get transaction icon/color based on type
  const getTransactionTypeInfo = (type: TransactionType) => {
    switch (type) {
      case TransactionType.PURCHASE:
        return { color: 'text-green-500', icon: '+', colorClass: 'text-green-600' };
      case TransactionType.USAGE:
        return { color: 'text-red-500', icon: '-', colorClass: 'text-red-600' };
      case TransactionType.REFUND:
        return { color: 'text-blue-500', icon: '+', colorClass: 'text-blue-600' };
      case TransactionType.BONUS:
        return { color: 'text-purple-500', icon: '+', colorClass: 'text-purple-600' };
      default:
        return { color: 'text-gray-500', icon: '•', colorClass: 'text-gray-600' };
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Credits</h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-blue-200"></div>
              <p className="mt-2 text-gray-500">Loading credits data...</p>
            </div>
          ) : (
            <>
              {/* Current Credits */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Your Current Balance</h2>
                      <p className="text-gray-500">Available credits for CV analysis</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{user?.credits || 0} credits</div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Tiers */}
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Purchase Credits</h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mb-6">
                {Object.entries(pricingTiers).map(([tier, { amount, price }]) => (
                  <Card key={tier} className={selectedTier === tier ? 'ring-2 ring-blue-500' : ''}>
                    <CardHeader>
                      <CardTitle className="capitalize">{tier} Package</CardTitle>
                      <CardDescription>{amount} credits</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">{formatCurrency(price)}</div>
                      <p className="text-sm text-gray-500 mt-2">
                        {(price / amount).toFixed(2)} per credit
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => handlePurchaseCredits(tier)}
                        disabled={purchasing}
                      >
                        {purchasing && selectedTier === tier 
                          ? 'Processing...' 
                          : `Purchase ${tier}`}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Transaction History */}
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction History</h2>
              <Card>
                <CardContent className="pt-6">
                  {transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Credits
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.map((transaction) => {
                            const { icon, colorClass } = getTransactionTypeInfo(transaction.type);
                            return (
                              <tr key={transaction.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(transaction.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 capitalize">
                                    {transaction.type}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {transaction.description}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${colorClass}`}>
                                  {icon}{Math.abs(transaction.amount)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No transaction history yet. Purchase some credits to get started.
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}