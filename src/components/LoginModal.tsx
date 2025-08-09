import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet, Mail, Github, Chrome, Shield, Zap } from 'lucide-react'

interface LoginModalProps {
  onClose: () => void
  onLogin: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const handleConnect = async (method: string) => {
    setSelectedMethod(method)
    setIsConnecting(true)
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsConnecting(false)
    onLogin()
    onClose()
  }

  const loginMethods = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: Wallet,
      description: 'Connect with MetaMask wallet',
      color: 'from-orange-500 to-yellow-500',
      popular: true
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: Shield,
      description: 'Connect with any wallet',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: Chrome,
      description: 'Connect with Coinbase',
      color: 'from-blue-600 to-blue-700'
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      description: 'Sign in with email',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Wallet className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600">
              Choose your preferred method to connect and start participating in photo quests
            </p>
          </div>

          {/* Login Methods */}
          <div className="p-6 space-y-3">
            {loginMethods.map((method) => {
              const Icon = method.icon
              const isLoading = isConnecting && selectedMethod === method.id

              return (
                <motion.button
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleConnect(method.id)}
                  disabled={isConnecting}
                  className="w-full flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Icon className="w-6 h-6 text-white" />
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{method.name}</span>
                      {method.popular && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>

                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    <Zap className="w-5 h-5" />
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="p-6 pt-0">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Secure connection powered by Web3</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default LoginModal
