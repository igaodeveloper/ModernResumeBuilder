import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet as WalletIcon, Coins, TrendingUp, Gift, CreditCard, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Transaction {
  id: string;
  type: "cashback" | "payment" | "bonus";
  amount: number;
  description: string;
  date: Date;
}

interface WalletProps {
  onUseCredit?: (amount: number) => void;
}

export function Wallet({ onUseCredit }: WalletProps) {
  const [balance, setBalance] = useState(25.50);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "cashback",
      amount: 5.00,
      description: "Cashback - Corte Clássico",
      date: new Date(Date.now() - 86400000)
    },
    {
      id: "2",
      type: "payment",
      amount: -45.00,
      description: "Pagamento - Pacote Completo",
      date: new Date(Date.now() - 172800000)
    },
    {
      id: "3",
      type: "cashback",
      amount: 3.50,
      description: "Cashback - Aparar Barba",
      date: new Date(Date.now() - 259200000)
    },
    {
      id: "4",
      type: "bonus",
      amount: 10.00,
      description: "Bônus de Cadastro",
      date: new Date(Date.now() - 604800000)
    }
  ]);
  const [showCashbackAnimation, setShowCashbackAnimation] = useState(false);
  const { user } = useAuth();

  const addCashback = (amount: number, description: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: "cashback",
      amount,
      description: `Cashback - ${description}`,
      date: new Date()
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setBalance(prev => prev + amount);
    setShowCashbackAnimation(true);

    setTimeout(() => setShowCashbackAnimation(false), 3000);
  };

  const useCredit = (amount: number) => {
    if (amount > balance) return false;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: "payment",
      amount: -amount,
      description: "Crédito utilizado no pagamento",
      date: new Date()
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setBalance(prev => prev - amount);
    onUseCredit?.(amount);
    return true;
  };

  // Simulate cashback earning
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 30 seconds
        addCashback(2.50, "Compra na loja");
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "cashback":
        return <Coins className="w-4 h-4 text-green-600" />;
      case "payment":
        return <CreditCard className="w-4 h-4 text-red-600" />;
      case "bonus":
        return <Gift className="w-4 h-4 text-purple-600" />;
      default:
        return <WalletIcon className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "cashback":
      case "bonus":
        return "text-green-600";
      case "payment":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  const totalCashback = transactions
    .filter(t => t.type === "cashback" || t.type === "bonus")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Cashback Animation */}
      <AnimatePresence>
        {showCashbackAnimation && (
          <motion.div
            initial={{ scale: 0, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -50 }}
            className="fixed top-20 right-4 z-50"
          >
            <Card className="bg-green-500 text-white shadow-lg">
              <CardContent className="p-4 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1, repeat: 2 }}
                >
                  <Coins className="w-6 h-6" />
                </motion.div>
                <div>
                  <p className="font-bold">Cashback recebido!</p>
                  <p className="text-sm">+R$ 2,50</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Balance */}
      <Card className="bg-gradient-to-r from-primary to-accent text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <WalletIcon className="w-6 h-6" />
            Carteira BarberPro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-blue-100 text-sm">Saldo disponível</p>
              <motion.p 
                className="text-3xl font-bold"
                key={balance}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                R$ {balance.toFixed(2)}
              </motion.p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/20 rounded-lg p-3">
                <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                <p className="text-xs text-blue-100">Total em Cashback</p>
                <p className="font-semibold">R$ {totalCashback.toFixed(2)}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <Coins className="w-5 h-5 mx-auto mb-1" />
                <p className="text-xs text-blue-100">Próximo Cashback</p>
                <p className="font-semibold">5% do valor</p>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => {
                // Simulate adding credit
                setBalance(prev => prev + 50);
                const newTransaction: Transaction = {
                  id: Date.now().toString(),
                  type: "bonus",
                  amount: 50,
                  description: "Recarga manual",
                  date: new Date()
                };
                setTransactions(prev => [newTransaction, ...prev]);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Crédito
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cashback Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-green-600" />
            Como Funciona o Cashback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge className="bg-green-100 text-green-800">5%</Badge>
              <div>
                <p className="font-medium">Pagamentos via PIX</p>
                <p className="text-sm text-muted-foreground">
                  Ganhe 5% de volta em todos os pagamentos via PIX
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-blue-100 text-blue-800">3%</Badge>
              <div>
                <p className="font-medium">Compras na loja</p>
                <p className="text-sm text-muted-foreground">
                  3% de cashback em produtos da BarberPro
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-purple-100 text-purple-800">10%</Badge>
              <div>
                <p className="font-medium">Indicação de amigos</p>
                <p className="text-sm text-muted-foreground">
                  10% do valor do primeiro corte do seu amigo
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {transactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.date.toLocaleDateString('pt-BR')} às{' '}
                      {transaction.date.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <span className={`font-bold ${getTransactionColor(transaction.type)}`}>
                  {transaction.amount > 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toFixed(2)}
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Use Credit Section */}
      {balance > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">Usar crédito no próximo pagamento?</p>
                <p className="text-sm text-green-600">
                  Você tem R$ {balance.toFixed(2)} disponível
                </p>
              </div>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => useCredit(Math.min(balance, 20))}
              >
                Usar R$ {Math.min(balance, 20).toFixed(2)}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}