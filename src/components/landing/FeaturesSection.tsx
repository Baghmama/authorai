import React from 'react';
import { Zap, Globe, Download, Users, Clock, Shield } from 'lucide-react';
import AnimateOnScroll from './AnimateOnScroll';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate complete chapter outlines and content in minutes. Our AI processes your ideas instantly.',
    gradient: 'from-sky-500 to-blue-600',
    bgLight: 'bg-sky-50',
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    description: 'Create books in 11 different languages including English, Spanish, French, German, and more.',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
  },
  {
    icon: Download,
    title: 'Export Ready',
    description: 'Download your completed book as PDF or Word document, ready for publishing or editing.',
    gradient: 'from-orange-500 to-amber-600',
    bgLight: 'bg-orange-50',
  },
  {
    icon: Users,
    title: 'User Friendly',
    description: 'Simple step-by-step process. No technical knowledge required. Just share your idea and let AI do the work.',
    gradient: 'from-rose-500 to-red-600',
    bgLight: 'bg-rose-50',
  },
  {
    icon: Clock,
    title: 'Save Time',
    description: "What used to take months now takes minutes. Focus on refining your ideas instead of struggling with writer's block.",
    gradient: 'from-amber-500 to-yellow-600',
    bgLight: 'bg-amber-50',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your ideas and content are protected. We use enterprise-grade security to keep your work safe.',
    gradient: 'from-cyan-500 to-teal-600',
    bgLight: 'bg-cyan-50',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-3">
              Why Author AI
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to write a book
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our advanced AI technology makes professional book writing accessible to everyone
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <AnimateOnScroll key={feature.title} delay={index * 80}>
              <div className="feature-card group bg-white p-7 rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm">
                <div className={`${feature.bgLight} w-12 h-12 rounded-xl flex items-center justify-center mb-5`}>
                  <div className={`bg-gradient-to-br ${feature.gradient} w-9 h-9 rounded-lg flex items-center justify-center`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-[15px]">{feature.description}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
