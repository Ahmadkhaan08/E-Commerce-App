import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import type { StatsData } from "@/lib/type";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router";
import StatsCard from "@/components/StatsCard";
import {
  Bookmark,
  LucideIndianRupee,
  Package,
  ShoppingBag,
  Tag,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
const COLORS = [
  "hsl(217, 91%, 60%)", // Blue
  "hsl(221, 83%, 53%)", // Indigo
  "hsl(262, 83%, 58%)", // Purple
  "hsl(350, 87%, 55%)", // Red
  "hsl(120, 60%, 50%)", // Green
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};
// const CustomBar = ({ x, y, width, height, index }: any) => (
//   <rect
//     x={x}
//     y={y}
//     width={width}
//     height={height}
//     fill={COLORS[index % COLORS.length]} // same logic as Cell
//     rx={4} // optional: rounded corners
//   />
// );
const Dashboard = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
    }).format(amount);
  };
  useEffect(() => {
    // console.log(formatCurrency(15000))
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await axiosPrivate.get("/stats");
        console.log(response);
        setStats(response.data);
      } catch (error) {
        console.log("Failed to load stats!", error);
        toast.error("Failed to load stats!");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const toastState = (location.state as { toast?: { type?: string; message?: string } } | null)?.toast;
    if (!toastState?.message) return;

    if (toastState.type === "error") {
      toast.error(toastState.message);
    } else {
      toast.success(toastState.message);
    }

    // Clear transient navigation state so toast is not replayed on refresh/back.
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-50 to-gray-100 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6 max-w-7xl mx-auto ">
          <motion.h1
            className="text-4xl font-bold text-gray-800"
            variants={cardVariants}
          >
            Dashboard Overview
          </motion.h1>
          {stats && (
            <>
              <motion.div
                className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                variants={containerVariants}
              >
                <motion.div variants={cardVariants}>
                  <StatsCard
                    title="Total Users"
                    value={stats.counts.users}
                    icon={<Users className="h-6 w-6 text-black" />}
                    href="/dashboard/users"
                    className="bg-white/95 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  />
                </motion.div>
                <motion.div variants={cardVariants}>
                  <StatsCard
                    title="Total Products"
                    value={stats.counts.products}
                    icon={<ShoppingBag className="h-6 w-6 text-black" />}
                    href="/dashboard/products"
                    className="bg-white/95 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  />
                </motion.div>
                <motion.div variants={cardVariants}>
                  <StatsCard
                    title="Total Categories"
                    value={stats.counts.categories}
                    icon={<Tag className="h-6 w-6 text-black" />}
                    href="/dashboard/categories"
                    className="bg-white/95 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  />
                </motion.div>
                <motion.div variants={cardVariants}>
                  <StatsCard
                    title="Total Brands"
                    value={stats.counts.brands}
                    icon={<Bookmark className="h-6 w-6 text-black" />}
                    href="/dashboard/brands"
                    className="bg-white/95 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  />
                </motion.div>
                <motion.div variants={cardVariants}>
                  <StatsCard
                    title="Total Orders"
                    value={stats.counts.orders}
                    icon={<Package className="h-4 w-4 text-black" />}
                    href="/dashboard/orders"
                    className="bg-white/95 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  />
                </motion.div>
                <motion.div variants={cardVariants}>
                  <StatsCard
                    title="Total Revenue"
                    value={formatCurrency(stats.counts.totalRevenue)}
                    icon={<LucideIndianRupee className="h-4 w-4 text-black" />}
                    href="/dashboard/accounts"
                    className="bg-white/95 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  />
                </motion.div>
              </motion.div>
              <motion.div
                className="grid gap-6 grid-cols-1 lg:grid-cols-2"
                variants={containerVariants}
              >
                <motion.div variants={cardVariants}>
                  <Card className="bg-white/95 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        Categories Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.categories}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                          />
                          <XAxis dataKey="name" tick={{ fill: "#4b5563" }} />
                          <YAxis tick={{ fill: "#4b5563" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="value"
                            name="Products"
                            radius={[4, 4, 0, 0]}
                            animationDuration={1000}
                          >
                            {stats.categories.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div variants={cardVariants}>
                  <Card className="bg-white/95 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        User Roles Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.roles}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) =>
                              `${name}: ${(percent! * 100).toFixed(0)}%`
                            }
                            outerRadius={100}
                            animationDuration={1000}
                            dataKey="value"
                          >
                            {stats.roles.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div variants={cardVariants} className="lg:col-span-2">
                  <Card className="bg-white/95 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        Brand Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.brands}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                          />
                          <XAxis dataKey="name" tick={{ fill: "#4b5563" }} />
                          <YAxis tick={{ fill: "#4b5563" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="value"
                            name="Products"
                            radius={[4, 4, 0, 0]}
                            animationDuration={1000}
                          >
                            {stats.brands.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
