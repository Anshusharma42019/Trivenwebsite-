import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import Category from '@/models/Category';
import { successResponse, errorResponse } from '@/lib/errors';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse('Authentication required.', 401);
    }

    const canViewOrders = hasPermission(user, PERMISSIONS.ORDERS_VIEW) || user.role === 'order_manager';
    const canViewReports = hasPermission(user, PERMISSIONS.REPORTS_VIEW) || hasPermission(user, PERMISSIONS.FINANCE_VIEW) || user.role === 'admin' || user.role === 'manager' || user.role === 'super_admin';

    if (!canViewOrders && !canViewReports) {
      return errorResponse('Unauthorized: Missing dashboard access permissions.', 403);
    }

    await connectDB();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      ordersByStatus,
      financialsAgg,
      totalCustomers,
      lowStockCount,
      outOfStockCount,
      recentOrders,
      bestsellingProducts,
      paymentMethodAgg,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: null,
            grossSales: { $sum: '$totalAmount' },
            totalDiscounts: { $sum: '$discountAmount' },
            totalTaxes: { $sum: '$taxAmount' },
            totalShipping: { $sum: '$shippingCharge' },
            deliveredRevenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'delivered'] }, '$totalAmount', 0],
              },
            },
            cancelledAmount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'cancelled'] }, '$totalAmount', 0],
              },
            },
          },
        },
      ]),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({
        $expr: { $and: [{ $lte: ['$stock', '$lowStockThreshold'] }, { $gt: ['$stock', 0] }] },
        status: { $ne: 'archived' },
      }),
      Product.countDocuments({ stock: 0, status: { $ne: 'archived' } }),
      Order.find().sort({ createdAt: -1 }).limit(8).lean(),
      Product.find({ status: 'published' }).sort({ isBestseller: -1, rating: -1, stock: -1 }).limit(5).lean(),
      Order.aggregate([
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            amount: { $sum: '$totalAmount' },
          },
        },
      ]),
    ]);

    // Format status map
    const statusMap = {
      pending: 0,
      processing: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };
    ordersByStatus.forEach((s) => {
      if (s._id) statusMap[s._id] = s.count;
    });

    const fin = financialsAgg[0] || {
      grossSales: 0,
      totalDiscounts: 0,
      totalTaxes: 0,
      totalShipping: 0,
      deliveredRevenue: 0,
      cancelledAmount: 0,
    };

    const netSales = Math.max(0, fin.grossSales - fin.cancelledAmount);
    const aov = totalOrders > 0 ? Math.round(fin.grossSales / totalOrders) : 0;

    return successResponse({
      summary: {
        totalOrders,
        todayOrders,
        grossSales: fin.grossSales,
        netSales,
        deliveredRevenue: fin.deliveredRevenue,
        refundsOrCancelled: fin.cancelledAmount,
        totalDiscounts: fin.totalDiscounts,
        totalTaxes: fin.totalTaxes,
        aov,
        totalCustomers,
        lowStockCount,
        outOfStockCount,
      },
      statusDistribution: statusMap,
      paymentMethodBreakdown: paymentMethodAgg,
      recentOrders,
      bestsellingProducts,
      userRole: user.role,
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
