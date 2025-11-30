import { calculatePercentage } from "../../utils/calculatePercentage";
import { OrderStatus } from "../order/order.interface";
import { Order } from "../order/order.model";

//*---------------------------------------------------------------Get dashboard 4 statistics-----------------------------------------
const dashboard = async () => {
  let stats = {};
  const today = new Date();
  const thisMonth = {
    start: new Date(today.getFullYear(), today.getMonth(), 1),
    end: today,
  };
  const lastMonth = {
    start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
    end: new Date(today.getFullYear(), today.getMonth(), 0),
  };

  //Promises for FourCards data
  const totalRevenuePromise = Order.aggregate([
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  const lastMonthRevenuePromise = Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: lastMonth.start,
          $lte: lastMonth.end,
        },
      },
    },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  const thisMonthRevenuePromise = Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: thisMonth.start,
          $lte: thisMonth.end,
        },
      },
    },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayTransactionPromise = Order.aggregate([
    { $match: { createdAt: { $gte: startOfToday } } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  const lastMonthAvgSalesPromise = Order.aggregate([
    { $match: { createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } } },
    { $group: { _id: null, avg: { $avg: "$total" } } },
  ]);

  const statuses = [OrderStatus.PROCESSING, OrderStatus.SHIPPED];
  const runningOrdersPromise = Order.countDocuments({
    status: { $in: statuses },
  });

  const todayTotalOrdersPromise = Order.countDocuments({
    createdAt: { $gte: startOfToday },
  });

  const lastMonthAvgOrdersPromise = Order.aggregate([
    { $match: { createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } } },
    {
      $group: {
        _id: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
        countPerDay: { $sum: 1 },
      },
    },

    {
      $group: {
        _id: null,
        avgOrdersPerDay: { $avg: "$countPerDay" },
      },
    },
  ]);

  const totalProductsSalesPromise = Order.aggregate([
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: null,
        totalSold: { $sum: "$orderItems.quantity" },
      },
    },
  ]);

  const thisMonthTotalProductsSalesPromise = Order.aggregate([
    {
      $match: {
        createdAt: { $gte: thisMonth.start, $lte: thisMonth.end },
      },
    },
    {
      $unwind: "$orderItems",
    },
    {
      $group: {
        _id: null,
        totalProductsSold: { $sum: "$orderItems.quantity" },
      },
    },
  ]);

  const lastMonthTotalProductsSalesPromise = Order.aggregate([
    {
      $match: {
        createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
      },
    },
    {
      $unwind: "$orderItems",
    },
    {
      $group: {
        _id: null,
        totalProductsSold: { $sum: "$orderItems.quantity" },
      },
    },
  ]);

  const [
    totalRevenueArr,
    lastMonthRevenueArr,
    thisMonthRevenueArr,
    todayTransactionArr,
    lastMonthAvgSalesArr,
    runningOrdersArr,
    todayTotalOrdersArr,
    lastMonthAvgOrdersArr,
    totalProductsSalesArr,
    thisMonthTotalProductsSalesArr,
    lastMonthTotalProductsSalesArr,
  ] = await Promise.all([
    totalRevenuePromise,
    lastMonthRevenuePromise,
    thisMonthRevenuePromise,
    todayTransactionPromise,
    lastMonthAvgSalesPromise,
    runningOrdersPromise,
    todayTotalOrdersPromise,
    lastMonthAvgOrdersPromise,
    totalProductsSalesPromise,
    thisMonthTotalProductsSalesPromise,
    lastMonthTotalProductsSalesPromise,
  ]);

  // Extract safe numbers
  const totalRevenue = parseFloat((totalRevenueArr[0]?.total || 0).toFixed(1));
  const lastMonthRevenue = lastMonthRevenueArr[0]?.total || 0;
  const thisMonthRevenue = thisMonthRevenueArr[0]?.total || 0;
  const todayTransaction = parseFloat(
    (todayTransactionArr[0]?.total || 0).toFixed(2),
  );
  const lastMonthAvgSales = lastMonthAvgSalesArr[0]?.avg || 0;
  const runningOrders = runningOrdersArr || 0;
  const todayTotalOrders = todayTotalOrdersArr || 0;
  const lastMonthAvgOrders = Math.ceil(
    lastMonthAvgOrdersArr[0]?.avgOrdersPerDay || 0,
  );
  const totalProductsSales = totalProductsSalesArr[0]?.totalSold || 0;
  const thisMonthTotalProductsSales =
    thisMonthTotalProductsSalesArr[0]?.totalProductsSold || 0;
  const lastMonthTotalProductsSales =
    lastMonthTotalProductsSalesArr[0]?.totalProductsSold || 0;

  const count = {
    totalRevenue,
    todayTransaction,
    runningOrders,
    totalProductsSales,
  };

  const changePercent = {
    revenue: calculatePercentage(lastMonthRevenue, thisMonthRevenue),
    transactionPercentage: calculatePercentage(
      lastMonthAvgSales,
      todayTransaction,
    ),
    ordersPercentage: calculatePercentage(lastMonthAvgOrders, todayTotalOrders),
    productsPercentage: calculatePercentage(
      lastMonthTotalProductsSales,
      thisMonthTotalProductsSales,
    ),
  };

  stats = {
    count,
    changePercent,
  };
  return stats;
};

//*-----------------------------------------------------------last12MonthsStats--------------------------------------------------------------

const last12MonthsStats = async () => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const today = new Date();
  const lastYear = new Date(today.getFullYear() - 1, today.getMonth() + 1, 1); // 12 months back

  // Aggregate revenue and order count per month for last 12 months
  const overviewDataRaw = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: lastYear, $lte: today },
      },
    },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }, // Sort by year and month
    },
  ]);

  // Initialize empty 12 months array
  const overviewData = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Mongo month is 1-based
    const record = overviewDataRaw.find(
      (r) => r._id.year === year && r._id.month === month,
    );

    overviewData.unshift({
      name: monthNames[month - 1],
      revenue: record ? Number(record.revenue.toFixed(2)) : 0.0,
      orders: record?.orders || 0,
    });
  }

  return overviewData;
};

//*-----------------------------------------------------------recentOrders--------------------------------------------------------------
const recentOrders = async (limit = 40) => {
  const recentOrders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const recentSales = recentOrders.map((order) => ({
    id: `#${order._id.toString().slice(-5)}`, // last 5 chars of ObjectId as a simple id
    amount: `$${order.total.toFixed(2)}`, // formatted amount
    quantity: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
    status: order.status,
  }));
  return recentSales;
};

//All exports
export const StatsServices = {
  dashboard,
  last12MonthsStats,
  recentOrders,
};
