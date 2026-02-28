import { motion } from "framer-motion";
import { Clock } from "lucide-react"; // optional icon for "coming soon"

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const} },
};

export default function ComingSoonCard() {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-center min-h-[50vh] p-4"
    >
      <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl hover:shadow-3xl transition-shadow duration-500 p-12 max-w-lg w-full text-center">
        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 text-white p-5 rounded-full shadow-lg">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
          Coming Soon!
        </h2>

        {/* Subtitle */}
        <p className="text-gray-500 text-lg mb-6">
          We’re working hard to bring this amazing feature to you. Stay tuned and check back soon!
        </p>

        {/* Gradient Button / Call-to-action */}
        <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform duration-300">
          Notify Me
        </button>
      </div>
    </motion.div>
  );
}