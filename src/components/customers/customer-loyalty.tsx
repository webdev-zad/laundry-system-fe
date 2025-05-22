"use client";

import { useState, useEffect, useCallback } from "react";
import { Award, Gift, Star, TrendingUp, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Customer } from "@/types/customer";
import { getCustomerLoyalty, getAvailableRewards, redeemPoints } from "@/services/loyaltyService";

interface CustomerLoyaltyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  onPointsUpdated?: (customer: Customer) => void;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: "discount" | "freeService" | "gift";
  expiryDays: number;
}

interface LoyaltyData {
  id: string;
  customerId: string;
  points: number;
  lifetimePoints: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  joinDate: string;
  redeemedRewards: {
    id: string;
    rewardId: string;
    reward: Reward;
    redeemedAt: string;
    expiresAt: string;
    pointsCost: number;
  }[];
}

export function CustomerLoyalty({ open, onOpenChange, customer, onPointsUpdated }: CustomerLoyaltyProps) {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch loyalty data when dialog opens
  const fetchLoyaltyData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCustomerLoyalty(customer.id);
      setLoyaltyData(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching loyalty data:", error);
      setError("Failed to load loyalty program data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [customer.id]);

  useEffect(() => {
    if (open && customer) {
      fetchLoyaltyData();
      fetchRewards();
    }
  }, [open, customer, fetchLoyaltyData]);

  const fetchRewards = async () => {
    try {
      const data = await getAvailableRewards();
      setRewards(data);
    } catch (err) {
      console.error("Failed to fetch rewards:", err);
    }
  };

  const handleRedeemReward = async (reward: Reward) => {
    try {
      setRedeeming(true);
      setRedeemSuccess(null);

      // Check if customer has enough points
      if ((loyaltyData?.points || 0) < reward.pointsCost) {
        setError(`Not enough points to redeem ${reward.name}`);
        return;
      }

      // Redeem the reward
      const result = await redeemPoints(customer.id, reward.id, reward.pointsCost);

      // Update local data
      if (loyaltyData) {
        setLoyaltyData({
          ...loyaltyData,
          points: loyaltyData.points - reward.pointsCost,
          redeemedRewards: [...loyaltyData.redeemedRewards, result],
        });

        setRedeemSuccess(`Successfully redeemed ${reward.name}!`);

        // Notify parent component
        if (onPointsUpdated) {
          onPointsUpdated({
            ...customer,
            loyaltyPoints: loyaltyData.points - reward.pointsCost,
          });
        }
      }
    } catch (err) {
      console.error("Failed to redeem reward:", err);
      setError("Failed to redeem reward. Please try again.");
    } finally {
      setRedeeming(false);
    }
  };

  // Get next tier info
  const getNextTier = () => {
    const points = loyaltyData?.points || 0;

    if (points < 200) return { name: "Silver", pointsNeeded: 200 - points, progress: (points / 200) * 100 };
    if (points < 500)
      return { name: "Gold", pointsNeeded: 500 - points, progress: ((points - 200) / 300) * 100 };
    if (points < 1000)
      return { name: "Platinum", pointsNeeded: 1000 - points, progress: ((points - 500) / 500) * 100 };

    return { name: "Platinum", pointsNeeded: 0, progress: 100 };
  };

  // Get tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "text-amber-600";
      case "silver":
        return "text-slate-400";
      case "gold":
        return "text-yellow-500";
      case "platinum":
        return "text-purple-500";
      default:
        return "";
    }
  };

  const nextTier = getNextTier();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error && !loyaltyData ? (
          <div className="text-center py-4">
            <p className="text-destructive mb-2">{error}</p>
            <Button variant="outline" onClick={fetchLoyaltyData}>
              Try Again
            </Button>
          </div>
        ) : loyaltyData ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Loyalty Program - {customer.name}
              </DialogTitle>
              <DialogDescription>View and manage loyalty points and rewards.</DialogDescription>
            </DialogHeader>

            {redeemSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4 flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-700 text-sm">{redeemSuccess}</p>
              </div>
            )}

            {error && !redeemSuccess && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Loyalty Status Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Loyalty Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-sm text-slate-500">Current Tier</div>
                      <div className="text-2xl font-bold flex items-center">
                        <Star className={`h-5 w-5 mr-2 ${getTierColor(loyaltyData.tier)}`} />
                        <span className="capitalize">{loyaltyData.tier}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Points Balance</div>
                      <div className="text-2xl font-bold">{loyaltyData.points}</div>
                    </div>
                  </div>

                  {nextTier.pointsNeeded > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Next Tier: {nextTier.name}</span>
                        <span>{nextTier.pointsNeeded} points needed</span>
                      </div>
                      <Progress value={nextTier.progress} className="h-2" />
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-slate-400" />
                      <span>Lifetime Points: {loyaltyData.lifetimePoints}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-slate-400" />
                      <span>Member Since: {new Date(loyaltyData.joinDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rewards Tabs */}
              <Tabs defaultValue="available">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="available">Available Rewards</TabsTrigger>
                  <TabsTrigger value="redeemed">Redeemed Rewards</TabsTrigger>
                </TabsList>

                <TabsContent value="available" className="space-y-4 mt-4">
                  {rewards.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Gift className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                      <p>No rewards available at the moment</p>
                    </div>
                  ) : (
                    rewards.map((reward) => (
                      <Card key={reward.id} className="overflow-hidden">
                        <div className="flex border-b">
                          <div className="flex-1 p-4">
                            <div className="font-medium">{reward.name}</div>
                            <p className="text-sm text-slate-500">{reward.description}</p>
                            <div className="mt-2 flex items-center">
                              <Badge variant="outline" className="mr-2">
                                {reward.pointsCost} points
                              </Badge>
                              <Badge variant="secondary">
                                {reward.type === "discount"
                                  ? "Discount"
                                  : reward.type === "freeService"
                                  ? "Free Service"
                                  : "Gift"}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-4 flex items-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => handleRedeemReward(reward)}
                                    disabled={loyaltyData.points < reward.pointsCost || redeeming}
                                    variant={loyaltyData.points >= reward.pointsCost ? "default" : "outline"}
                                  >
                                    Redeem
                                  </Button>
                                </TooltipTrigger>
                                {loyaltyData.points < reward.pointsCost && (
                                  <TooltipContent>
                                    <p>You need {reward.pointsCost - loyaltyData.points} more points</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="redeemed" className="space-y-4 mt-4">
                  {!loyaltyData.redeemedRewards || loyaltyData.redeemedRewards.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Gift className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                      <p>No rewards redeemed yet</p>
                    </div>
                  ) : (
                    loyaltyData.redeemedRewards.map((redeemedReward) => (
                      <Card key={redeemedReward.id} className="overflow-hidden">
                        <div className="p-4">
                          <div className="font-medium">{redeemedReward.reward.name}</div>
                          <p className="text-sm text-slate-500">{redeemedReward.reward.description}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <Badge variant="outline">{redeemedReward.reward.pointsCost} points</Badge>
                            <div className="text-xs text-slate-500">
                              Redeemed on {new Date(redeemedReward.redeemedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
