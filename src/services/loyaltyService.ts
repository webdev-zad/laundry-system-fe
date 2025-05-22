import api from "./api";

// Get loyalty program details for a customer
export const getCustomerLoyalty = async (customerId: string) => {
  const response = await api.get(`/loyalty/${customerId}`);
  return response.data;
};

// Add points to a customer
export const addLoyaltyPoints = async (customerId: string, points: number) => {
  const response = await api.post(`/loyalty/${customerId}/add-points`, { points });
  return response.data;
};

// Redeem points for a reward
export const redeemPoints = async (customerId: string, rewardId: string, pointsCost: number) => {
  const response = await api.post(`/loyalty/${customerId}/redeem`, {
    rewardId,
    pointsCost,
  });
  return response.data;
};

// Get available rewards
export const getAvailableRewards = async () => {
  const response = await api.get("/loyalty/rewards");
  return response.data;
};

// Calculate tier based on points
export const calculateTier = (points: number): "bronze" | "silver" | "gold" | "platinum" => {
  if (points >= 1000) return "platinum";
  if (points >= 500) return "gold";
  if (points >= 200) return "silver";
  return "bronze";
};
