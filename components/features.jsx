import { 
  Sparkles, 
  Image as ImageIcon, 
  Scissors, 
  Layout, 
  Zap, 
  Crown 
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Restoration",
    description: "Restore 50-year-old blurry or damaged photos to HD quality in seconds with our advanced neural engine.",
    color: "from-blue-400 to-indigo-600",
  },
  {
    icon: ImageIcon,
    title: "HD Upscaler",
    description: "Increase resolution by 2x or 4x without losing detail, making your small photos print-ready.",
    color: "from-purple-400 to-pink-600",
  },
  {
    icon: Scissors,
    title: "Background Remover",
    description: "Cleanly remove any background with pixel-perfect precision using automated AI masking.",
    color: "from-cyan-400 to-blue-600",
  },
  {
    icon: Layout,
    title: "Side-by-Side View",
    description: "Compare your results in real-time with our interactive comparison slider for every project.",
    color: "from-indigo-400 to-purple-600",
  },
  {
    icon: Zap,
    title: "Instant Processing",
    description: "No more waiting for hours. Our cloud-based GPU servers process your images in real-time.",
    color: "from-yellow-400 to-orange-600",
  },
  {
    icon: Crown,
    title: "Pro HD Exports",
    description: "Export in multiple high-quality formats including PNG, JPG, and WEBP for professional use.",
    color: "from-rose-400 to-red-600",
  },
];

function FeatureCard({ icon: Icon, title, description, color, delay }) {
  return (
    <div
      className="bg-slate-900/50 border border-white/5 p-10 rounded-[2.5rem] hover:border-indigo-500/30 transition-all duration-500 group relative overflow-hidden"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
      
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} p-4 mb-8 group-hover:scale-110 transition-transform duration-500 shadow-2xl`}>
        <Icon className="w-full h-full text-white" />
      </div>

      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors">
        {title}
      </h3>
      
      <p className="text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// Features Section Component
const FeaturesSection = () => {

  return (
    <section className="py-32" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-6 tracking-tight">
            AI-Powered Restoration
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Everything you need to transform old, blurry, or damaged photos into stunning HD masterpieces with just one click.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
