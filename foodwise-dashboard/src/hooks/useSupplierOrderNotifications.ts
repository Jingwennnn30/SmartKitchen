import { useState, useEffect } from 'react';
import { supplierOrderService } from '../services/supplierOrderService';

export const useSupplierOrderNotifications = () => {
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date>(new Date());

  useEffect(() => {
    const checkForNewOrders = async () => {
      try {
        const orders = await supplierOrderService.fetchOrderStockData();
        
        // Count orders that were created after the last check time
        const newOrders = orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          return orderDate > lastCheckedTime && order.status === 'pending';
        });

        setNewOrderCount(newOrders.length);
      } catch (error) {
        console.error('Error checking for new orders:', error);
      }
    };

    // Check immediately
    checkForNewOrders();

    // Then check every 30 seconds
    const interval = setInterval(checkForNewOrders, 30000);

    return () => clearInterval(interval);
  }, [lastCheckedTime]);

  const markAsChecked = () => {
    setLastCheckedTime(new Date());
    setNewOrderCount(0);
  };

  return {
    newOrderCount,
    markAsChecked
  };
};