import { useEffect, useState } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Warehouse,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '../api/client';

export default function Dashboard() {
  const [summary, setSummary] = useState({
    total_customers: 0,
    total_products: 0,
    orders_today: 0,
    stock_items: 0,
    recent_orders: [] as Array<{
      id: number;
      total: number;
      status: string;
      created_at: string;
      customer_name: string;
    }>,
    top_products: [] as Array<{
      id: number;
      name: string;
      sku: string;
      total_sold: number;
    }>,
  });

  useEffect(() => {
    apiFetch<typeof summary>('/dashboard/summary')
      .then(setSummary)
      .catch(() => {});
  }, []);

  const kpiCards = [
    {
      title: 'Total Customers',
      value: summary.total_customers.toLocaleString(),
      change: '—',
      trend: 'up',
      icon: Users,
      color: 'bg-[#EBEBEB]'
    },
    {
      title: 'Products',
      value: summary.total_products.toLocaleString(),
      change: '—',
      trend: 'up',
      icon: Package,
      color: 'bg-[#040303]'
    },
    {
      title: 'Orders Today',
      value: summary.orders_today.toLocaleString(),
      change: '—',
      trend: 'down',
      icon: ShoppingCart,
      color: 'bg-[#EBEBEB]'
    },
    {
      title: 'Stock Items',
      value: summary.stock_items.toLocaleString(),
      change: '—',
      trend: 'up',
      icon: Warehouse,
      color: 'bg-[#040303]'
    }
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold text-[#040303]">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, here's what's happening today</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === 'up' ? TrendingUp : TrendingDown;
          const isLight = card.color === 'bg-[#EBEBEB]';
          
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${isLight ? 'text-[#040303]' : 'text-white'}`} />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                    card.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}
                >
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">{card.change}</span>
                </motion.div>
              </div>
              <h3 className="text-gray-500 text-sm mb-1">{card.title}</h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="text-2xl font-semibold text-[#040303]"
              >
                {card.value}
              </motion.p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-[#040303]">Recent Orders</h2>
            <motion.button 
              whileHover={{ x: 5 }}
              className="text-[#040303] text-sm font-medium hover:text-gray-700 flex items-center gap-1 transition-colors duration-200"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
          <div className="space-y-4">
            {summary.recent_orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                whileHover={{ x: 5, scale: 1.02 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 cursor-pointer"
              >
                <div className="flex-1">
                  <p className="font-medium text-[#040303]">ORD-{order.id}</p>
                  <p className="text-sm text-gray-500">{order.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#040303]">
                    ${Number(order.total).toFixed(2)}
                  </p>
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-50 text-green-600' :
                      order.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                      'bg-yellow-50 text-yellow-600'
                    }`}
                  >
                    {order.status
                      ? order.status[0].toUpperCase() + order.status.slice(1)
                      : 'Pending'}
                  </motion.span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-[#040303]">Top Products</h2>
            <motion.button 
              whileHover={{ x: 5 }}
              className="text-[#040303] text-sm font-medium hover:text-gray-700 flex items-center gap-1 transition-colors duration-200"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
          <div className="space-y-4">
            {summary.top_products.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                whileHover={{ x: 5, scale: 1.02 }}
                className="flex items-center gap-4 cursor-pointer transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`w-8 h-8 ${index % 2 === 0 ? 'bg-[#EBEBEB] text-[#040303]' : 'bg-[#040303] text-white'} rounded-lg flex items-center justify-center font-semibold text-sm`}
                >
                  {index + 1}
                </motion.div>
                <div className="flex-1">
                  <p className="font-medium text-[#040303]">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.total_sold} sales</p>
                </div>
                <p className="font-semibold text-[#040303]">{product.sku}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <h2 className="font-semibold text-[#040303] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Add Customer' },
            { icon: Package, label: 'New Product' },
            { icon: ShoppingCart, label: 'Create Order' },
            { icon: Warehouse, label: 'Stock Update' }
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-[#040303] hover:text-white transition-all duration-300 group"
              >
                <Icon className="w-5 h-5 text-[#040303] group-hover:text-white transition-colors duration-300" />
                <span className="font-medium text-[#040303] group-hover:text-white transition-colors duration-300">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}