import { useEffect, useState } from 'react';
import { Package, TrendingUp, TrendingDown, Calendar, Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '../api/client';

export default function InventoryMovements() {
  const [filterType, setFilterType] = useState('all');
  const [movements, setMovements] = useState<
    Array<{
      id: number;
      created_at: string;
      product_name: string;
      movement_type: string;
      quantity: number;
      location: string | null;
      reference: string | null;
      user_name: string | null;
    }>
  >([]);
  const [summary, setSummary] = useState({
    total_received: 0,
    total_dispatched: 0,
    total_adjusted: 0,
    net_change: 0,
  });

  useEffect(() => {
    apiFetch<{ items: typeof movements }>(
      `/inventory/movements?page=1&pageSize=100`
    )
      .then((data) => setMovements(data.items))
      .catch(() => {});

    apiFetch<typeof summary>('/inventory/summary')
      .then(setSummary)
      .catch(() => {});
  }, []);

  const filteredMovements =
    filterType === 'all'
      ? movements
      : movements.filter((m) =>
          filterType === 'in'
            ? m.movement_type === 'stock_in'
            : m.movement_type === 'stock_out' || m.movement_type === 'sale'
        );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold text-[#040303]">Inventory Movements</h1>
          <p className="text-gray-500 mt-1">Track all stock movements and transactions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#040303] text-white rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-300"
        >
          <Download className="w-5 h-5" />
          Export Report
        </motion.button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: TrendingUp, label: 'Stock In', value: summary.total_received, color: 'bg-green-500', badgeColor: 'text-green-600 bg-green-50' },
          { icon: TrendingDown, label: 'Stock Out', value: summary.total_dispatched, color: 'bg-red-500', badgeColor: 'text-red-600 bg-red-50' },
          { icon: Package, label: 'Net Change', value: summary.net_change, color: 'bg-[#040303]', badgeColor: 'text-[#040303] bg-gray-100' }
        ].map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
                <span className={`text-xs font-medium ${card.badgeColor} px-3 py-1 rounded-lg`}>
                  {card.label}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm mb-1">Total {card.label === 'Stock In' ? 'Received' : card.label === 'Stock Out' ? 'Dispatched' : 'Difference'}</h3>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1, type: "spring" }}
                className="text-2xl font-semibold text-[#040303]"
              >
                {card.value} units
              </motion.p>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All Movements', color: 'bg-[#040303]' },
              { id: 'in', label: 'Stock In', color: 'bg-green-500' },
              { id: 'out', label: 'Stock Out', color: 'bg-red-500' }
            ].map((filter) => (
              <motion.button
                key={filter.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterType(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  filterType === filter.id
                    ? `${filter.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Timeline / Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Date & Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Reference</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMovements.map((movement, index) => (
                <motion.tr
                  key={movement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ backgroundColor: '#f9fafb', scale: 1.01 }}
                  className="transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-[#040303]">
                        {new Date(movement.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(movement.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-[#040303]">{movement.product_name}</p>
                      <p className="text-sm text-gray-500 font-mono">#{movement.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${
                        movement.movement_type === 'stock_in'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {movement.movement_type === 'stock_in' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {movement.movement_type === 'stock_in' ? 'Stock In' : 'Stock Out'}
                    </motion.span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[#040303]">{movement.quantity}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{movement.location || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-[#040303] bg-gray-100 px-2 py-1 rounded">
                      {movement.reference || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{movement.user_name || '—'}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}