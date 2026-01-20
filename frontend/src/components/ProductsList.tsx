import { useEffect, useState } from 'react';
import { Search, Plus, Package, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '../api/client';

export default function ProductsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<
    Array<{
      id: number | string;
      sku: string;
      name: string;
      category: string | null;
      price: number;
      stock_quantity: number;
      status: string | null;
    }>
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number | string;
    sku: string;
    name: string;
    category: string | null;
    price: number;
    stock_quantity: number;
    status: string | null;
    is_active?: boolean;
    created_at?: string;
  } | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock_quantity: '0',
  });

  const loadProducts = () => {
    apiFetch<{ items: typeof products }>(
      `/products?search=${encodeURIComponent(searchQuery)}&page=1&pageSize=100`
    )
      .then((data) => setProducts(data.items))
      .catch(() => {});
  };

  useEffect(() => {
    loadProducts();
  }, [searchQuery]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: formValues.name.trim(),
          sku: formValues.sku.trim(),
          category: formValues.category.trim() || null,
          price: Number(formValues.price),
          stock_quantity: Number(formValues.stock_quantity || 0),
        }),
      });

      setIsModalOpen(false);
      setFormValues({
        name: '',
        sku: '',
        category: '',
        price: '',
        stock_quantity: '0',
      });
      loadProducts();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = async (id: number | string) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setSelectedProduct(null);
    try {
      const data = await apiFetch<typeof selectedProduct>(`/products/${id}`);
      setSelectedProduct(data);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Failed to load product'
      );
    } finally {
      setDetailsLoading(false);
    }
  };

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
          <h1 className="text-2xl font-semibold text-[#040303]">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#040303] text-white rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </motion.button>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, SKU, or category..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300 focus:scale-105"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors duration-200"
          >
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Filters</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">SKU</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ backgroundColor: '#f9fafb', scale: 1.01 }}
                  className="transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        className={`w-12 h-12 ${index % 2 === 0 ? 'bg-[#EBEBEB]' : 'bg-gray-100'} rounded-xl flex items-center justify-center text-2xl`}
                      >
                        📦
                      </motion.div>
                      <div>
                        <p className="font-medium text-[#040303]">{product.name}</p>
                        <p className="text-sm text-gray-500">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                      {product.sku}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{product.category || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-[#040303]">
                      ${Number(product.price).toFixed(2)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-[#040303] font-medium">{product.stock_quantity}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                        product.status === 'in_stock' ? 'bg-green-50 text-green-600' :
                        product.status === 'low_stock' ? 'bg-yellow-50 text-yellow-600' :
                        'bg-red-50 text-red-600'
                      }`}
                    >
                      {product.status === 'in_stock'
                        ? 'In Stock'
                        : product.status === 'low_stock'
                        ? 'Low Stock'
                        : 'Out of Stock'}
                    </motion.span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="px-3 py-1.5 text-sm font-medium text-[#040303] hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        onClick={() => handleViewDetails(product.id)}
                      >
                        View
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#040303]">Add Product</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-[#040303] transition-colors"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 text-red-600 px-3 py-2 text-sm">
                {formError}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleCreateProduct}>
              <div>
                <label className="block text-sm font-medium text-[#040303] mb-2">
                  Product Name
                </label>
                <input
                  value={formValues.name}
                  onChange={(e) =>
                    setFormValues({ ...formValues, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300"
                  placeholder="Product name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#040303] mb-2">
                  SKU
                </label>
                <input
                  value={formValues.sku}
                  onChange={(e) =>
                    setFormValues({ ...formValues, sku: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300"
                  placeholder="PRD-001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#040303] mb-2">
                  Category
                </label>
                <input
                  value={formValues.category}
                  onChange={(e) =>
                    setFormValues({ ...formValues, category: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300"
                  placeholder="Category"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#040303] mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.price}
                    onChange={(e) =>
                      setFormValues({ ...formValues, price: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#040303] mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formValues.stock_quantity}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        stock_quantity: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:text-[#040303] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#040303] text-white rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDetailsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#040303]">
                Product Details
              </h2>
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                className="text-gray-500 hover:text-[#040303] transition-colors"
              >
                ✕
              </button>
            </div>

            {detailsLoading && (
              <p className="text-sm text-gray-500">Loading product...</p>
            )}

            {!detailsLoading && selectedProduct && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase text-gray-400">Name</p>
                  <p className="text-lg font-semibold text-[#040303]">
                    {selectedProduct.name}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase text-gray-400">SKU</p>
                    <p className="text-sm text-gray-700">
                      {selectedProduct.sku}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-400">Category</p>
                    <p className="text-sm text-gray-700">
                      {selectedProduct.category || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-400">Price</p>
                    <p className="text-sm text-gray-700">
                      ${Number(selectedProduct.price).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-400">Stock</p>
                    <p className="text-sm text-gray-700">
                      {selectedProduct.stock_quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-400">Status</p>
                    <p className="text-sm text-gray-700">
                      {selectedProduct.status === 'in_stock'
                        ? 'In Stock'
                        : selectedProduct.status === 'low_stock'
                        ? 'Low Stock'
                        : 'Out of Stock'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-400">Created</p>
                    <p className="text-sm text-gray-700">
                      {selectedProduct.created_at
                        ? new Date(selectedProduct.created_at).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}