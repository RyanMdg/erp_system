import { useEffect, useState } from 'react';
import { Search, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api/client';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function OrderCreation() {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [availableProducts, setAvailableProducts] = useState<
    Array<{ id: string; name: string; price: number; stock_quantity: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [orders, setOrders] = useState<
    Array<{
      id: string;
      order_number?: string | null;
      customer_name: string;
      total: number;
      status: string;
      payment_status?: string;
      created_at: string;
    }>
  >([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const loadOptions = () => {
    setLoading(true);
    setErrorMessage('');
    Promise.all([
      apiFetch<{ items: Array<{ id: string; name: string }> }>(
        '/customers?page=1&pageSize=100'
      ),
      apiFetch<{
        items: Array<{ id: string; name: string; price: number; stock_quantity: number }>;
      }>('/products?page=1&pageSize=100'),
    ])
      .then(([customersResult, productsResult]) => {
        setCustomers(customersResult.items);
        setAvailableProducts(
          productsResult.items.map((product) => ({
            ...product,
            price: Number(product.price),
            stock_quantity: Number(product.stock_quantity),
          }))
        );
      })
      .catch((error) => {
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to load order data'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOptions();
    loadOrders();
  }, []);

  const loadOrders = () => {
    setOrdersLoading(true);
    setOrdersError('');
    apiFetch<{ items: typeof orders }>(`/orders?page=1&pageSize=20`)
      .then((data) => setOrders(data.items))
      .catch((error) => {
        setOrdersError(
          error instanceof Error ? error.message : 'Failed to load orders'
        );
      })
      .finally(() => setOrdersLoading(false));
  };

  const addProduct = () => {
    if (!selectedProduct) return;
    
    const product = availableProducts.find(p => String(p.id) === String(selectedProduct));
    if (!product) return;

    const existingItem = orderItems.find(item => item.productId === String(product.id));
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.productId === String(product.id)
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        productId: String(product.id),
        name: product.name,
        price: Number(product.price),
        quantity: quantity
      }]);
    }
    
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeProduct = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setOrderItems(orderItems.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const createOrder = async () => {
    if (!selectedCustomer || orderItems.length === 0) return;
    try {
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: selectedCustomer,
          items: orderItems.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.price
          }))
        })
      });
      alert('Order created');
      setOrderItems([]);
      setSelectedCustomer('');
      setSelectedProduct('');
      setQuantity(1);
      loadOptions();
      loadOrders();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create order');
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      loadOrders();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const updatePaymentStatus = async (id: string, payment_status: string) => {
    try {
      await apiFetch(`/orders/${id}/payment`, {
        method: 'PATCH',
        body: JSON.stringify({ payment_status }),
      });
      loadOrders();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update payment');
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold text-[#040303]">Create New Order</h1>
        <p className="text-gray-500 mt-1">Add products and create an order for a customer</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h2 className="font-semibold text-[#040303] mb-4">Customer Information</h2>
            <div>
              <label className="block text-sm font-medium text-[#040303] mb-2">
                Select Customer
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300 focus:scale-105"
              >
                <option value="">Choose a customer...</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Add Products */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h2 className="font-semibold text-[#040303] mb-4">Add Products</h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#040303] mb-2">
                  Select Product
                </label>
              <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300"
                >
                  <option value="">Choose a product...</option>
                  {availableProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${Number(product.price).toFixed(2)} (Stock: {product.stock_quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium text-[#040303] mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300"
                />
              </div>
              <div className="flex items-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addProduct}
                  disabled={!selectedProduct}
                  className="px-5 py-3 bg-[#040303] text-white rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h2 className="font-semibold text-[#040303] mb-4">Order Items</h2>
            <AnimatePresence mode="popLayout">
              {orderItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-12"
                >
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No items added yet</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-[#040303]">{item.name}</p>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#040303] transition-all duration-300"
                      />
                      <p className="w-24 text-right font-semibold text-[#040303]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeProduct(item.productId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#040303]">Recent Orders</h2>
              <button
                type="button"
                onClick={loadOrders}
                className="text-sm text-gray-600 hover:text-[#040303]"
              >
                Refresh
              </button>
            </div>
            {ordersError && (
              <p className="text-sm text-red-600 mb-3">{ordersError}</p>
            )}
            {ordersLoading ? (
              <p className="text-sm text-gray-500">Loading orders...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2">Order</th>
                      <th className="py-2">Customer</th>
                      <th className="py-2">Total</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Payment</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="py-2 font-medium text-[#040303]">
                          {order.order_number || `ORD-${order.id}`}
                        </td>
                        <td className="py-2">{order.customer_name}</td>
                        <td className="py-2">${Number(order.total).toFixed(2)}</td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs ${
                              order.status === 'completed'
                                ? 'bg-green-50 text-green-600'
                                : order.status === 'processing'
                                ? 'bg-blue-50 text-blue-600'
                                : order.status === 'cancelled'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-yellow-50 text-yellow-600'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs ${
                              order.payment_status === 'paid'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {order.payment_status || 'unpaid'}
                          </span>
                        </td>
                        <td className="py-2 space-x-2">
                          {order.status !== 'processing' && order.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                              className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-600"
                            >
                              Processing
                            </button>
                          )}
                          {order.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-600"
                            >
                              Complete
                            </button>
                          )}
                          {order.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              updatePaymentStatus(
                                order.id,
                                order.payment_status === 'paid' ? 'unpaid' : 'paid'
                              )
                            }
                            className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700"
                          >
                            {order.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm sticky top-8"
          >
            <h2 className="font-semibold text-[#040303] mb-4">Order Summary</h2>
            
            <motion.div 
              className="space-y-3 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <motion.span
                  key={subtotal}
                  initial={{ scale: 1.2, color: '#040303' }}
                  animate={{ scale: 1, color: '#6b7280' }}
                  className="font-medium"
                >
                  ${subtotal.toFixed(2)}
                </motion.span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-semibold text-[#040303]">Total</span>
                  <motion.span
                    key={total}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="font-semibold text-[#040303] text-xl"
                  >
                    ${total.toFixed(2)}
                  </motion.span>
                </div>
              </div>
            </motion.div>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                disabled={orderItems.length === 0 || !selectedCustomer || loading}
                onClick={createOrder}
                className="w-full py-3 bg-[#040303] text-white rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Create Order
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
              >
                Save as Draft
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-4 bg-gray-50 rounded-xl"
            >
              <h3 className="text-sm font-semibold text-[#040303] mb-2">Order Details</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p>Items: {orderItems.length}</p>
                <p>Total Units: {orderItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
                <p>
                  Customer:{' '}
                  {selectedCustomer
                    ? customers.find(c => String(c.id) === String(selectedCustomer))?.name
                    : 'Not selected'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      {errorMessage && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}