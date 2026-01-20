import { useEffect, useState } from 'react';
import { Search, Plus, Mail, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '../api/client';

export default function CustomersList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [customers, setCustomers] = useState<
    Array<{
      id: number;
      name: string;
      contact_email: string | null;
      contact_phone: string | null;
      city: string | null;
      country: string | null;
    }>
  >([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
    contact_email: string | null;
    contact_phone: string | null;
    city: string | null;
    country: string | null;
    is_active?: boolean;
    created_at?: string;
  } | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    city: '',
    country: '',
  });

  const loadCustomers = () => {
    apiFetch<{ items: typeof customers; meta: { totalItems: number } }>(
      `/customers?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&pageSize=${itemsPerPage}`
    )
      .then((data) => {
        setCustomers(data.items);
        setTotalItems(data.meta.totalItems);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadCustomers();
  }, [searchQuery, currentPage]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      await apiFetch('/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: formValues.name.trim(),
          contact_email: formValues.contact_email.trim() || null,
          contact_phone: formValues.contact_phone.trim() || null,
          city: formValues.city.trim() || null,
          country: formValues.country.trim() || null,
        }),
      });

      setIsModalOpen(false);
      setFormValues({
        name: '',
        contact_email: '',
        contact_phone: '',
        city: '',
        country: '',
      });
      loadCustomers();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to add customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = async (id: number) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setSelectedCustomer(null);
    try {
      const data = await apiFetch<{
        id: number;
        name: string;
        contact_email: string | null;
        contact_phone: string | null;
        city: string | null;
        country: string | null;
        is_active?: boolean;
        created_at?: string;
      }>(`/customers/${id}`);
      setSelectedCustomer(data);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Failed to load customer'
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const totalPages = Math.max(Math.ceil(totalItems / itemsPerPage), 1);
  const startIndex = (currentPage - 1) * itemsPerPage;

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
          <h1 className="text-2xl font-semibold text-[#040303]">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your customer relationships</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#040303] text-white rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </motion.button>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search customers by name or email..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300 focus:scale-105"
          />
        </div>
      </motion.div>

      {/* Customers Table */}
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Orders</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Total Spent</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#040303]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ backgroundColor: '#f9fafb', scale: 1.01 }}
                  className="transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        className={`w-10 h-10 ${index % 2 === 0 ? 'bg-[#EBEBEB] text-[#040303]' : 'bg-[#040303] text-white'} rounded-xl flex items-center justify-center font-semibold`}
                      >
                        {customer.name.charAt(0)}
                      </motion.div>
                      <div>
                        <p className="font-medium text-[#040303]">{customer.name}</p>
                        <p className="text-sm text-gray-500">ID: {customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {customer.contact_email || '—'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {customer.contact_phone || '—'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {[customer.city, customer.country].filter(Boolean).join(', ') || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-[#040303] rounded-lg text-sm font-medium"
                    >
                      —
                    </motion.span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-[#040303]">—</p>
                  </td>
                  <td className="px-6 py-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleViewDetails(customer.id)}
                      className="px-4 py-2 text-sm font-medium text-[#040303] hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      View Details
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} customers
          </p>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === page
                    ? 'bg-[#040303] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
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
              <h2 className="text-xl font-semibold text-[#040303]">Add Customer</h2>
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

            <form className="space-y-4" onSubmit={handleCreateCustomer}>
              <div>
                <label className="block text-sm font-medium text-[#040303] mb-2">
                  Name
                </label>
                <input
                  value={formValues.name}
                  onChange={(e) =>
                    setFormValues({ ...formValues, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300"
                  placeholder="Customer name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#040303] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formValues.contact_email}
                  onChange={(e) =>
                    setFormValues({ ...formValues, contact_email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300"
                  placeholder="name@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#040303] mb-2">
                  Phone
                </label>
                <input
                  value={formValues.contact_phone}
                  onChange={(e) =>
                    setFormValues({ ...formValues, contact_phone: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#040303] mb-2">
                    City
                  </label>
                  <input
                    value={formValues.city}
                    onChange={(e) =>
                      setFormValues({ ...formValues, city: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#040303] mb-2">
                    Country
                  </label>
                  <input
                    value={formValues.country}
                    onChange={(e) =>
                      setFormValues({ ...formValues, country: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300"
                    placeholder="Country"
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
                  {isSubmitting ? 'Saving...' : 'Save Customer'}
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
                Customer Details
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
              <p className="text-sm text-gray-500">Loading customer...</p>
            )}

            {!detailsLoading && selectedCustomer && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase text-gray-400">Name</p>
                  <p className="text-lg font-semibold text-[#040303]">
                    {selectedCustomer.name}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase text-gray-400">Email</p>
                    <p className="text-sm text-gray-700">
                      {selectedCustomer.contact_email || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-400">Phone</p>
                    <p className="text-sm text-gray-700">
                      {selectedCustomer.contact_phone || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-400">City</p>
                    <p className="text-sm text-gray-700">
                      {selectedCustomer.city || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-400">Country</p>
                    <p className="text-sm text-gray-700">
                      {selectedCustomer.country || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-400">Status</p>
                    <p className="text-sm text-gray-700">
                      {selectedCustomer.is_active === false
                        ? 'Inactive'
                        : 'Active'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-400">Created</p>
                    <p className="text-sm text-gray-700">
                      {selectedCustomer.created_at
                        ? new Date(selectedCustomer.created_at).toLocaleDateString()
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