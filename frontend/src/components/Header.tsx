import { Menu, Search, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';

type HeaderProps = {
  user: { full_name: string; role: string } | null;
  onMenuClick: () => void;
};

export default function Header({ user, onMenuClick }: HeaderProps) {
  const displayName = user?.full_name || 'User';
  const displayRole = user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : 'Staff';
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white border-b border-gray-200 px-8 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Search */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 max-w-xl flex items-center gap-3"
        >
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#040303] focus:border-transparent transition-all duration-300 focus:scale-105"
            />
          </div>
        </motion.div>

        {/* Right Section */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          {/* Notifications */}
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 hover:bg-gray-50 rounded-xl transition-all duration-300"
          >
            <Bell className="w-5 h-5 text-[#040303]" />
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
            ></motion.span>
          </motion.button>

          {/* User Profile */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 pl-3 cursor-pointer"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-[#040303]">{displayName}</p>
              <p className="text-xs text-gray-500">{displayRole}</p>
            </div>
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-[#040303] rounded-xl flex items-center justify-center"
            >
              <User className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
}