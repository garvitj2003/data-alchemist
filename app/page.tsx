"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/themeToggle";
import { motion } from "framer-motion";
import {
  Upload,
  Zap,
  CheckCircle,
  Settings,
  Download,
  ChevronRight,
  FileSpreadsheet,
  Bot,
  AlertTriangle,
  Sliders,
  FileCheck,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: Upload,
      title: "Smart File Upload",
      description:
        "Drop your messy CSV or Excel files and watch the magic happen. Our AI instantly analyzes your data structure.",
    },
    {
      icon: Bot,
      title: "AI-Powered Validation",
      description:
        "Advanced AI checks for errors, inconsistencies, and missing data. Get smart suggestions for fixing issues.",
    },
    {
      icon: CheckCircle,
      title: "Visual Data Grid",
      description:
        "Edit your data in an intuitive spreadsheet-like interface. Fix errors with one-click suggestions.",
    },
    {
      icon: Settings,
      title: "Natural Language Rules",
      description:
        "Create business rules by typing in plain English. No coding required – just describe what you need.",
    },
    {
      icon: Sliders,
      title: "Smart Prioritization",
      description:
        "Use intuitive sliders to balance cost, speed, and quality. See real-time impact of your choices.",
    },
    {
      icon: Download,
      title: "Export Ready Data",
      description:
        "Download clean CSV files and configured rules.json ready for your downstream allocation tools.",
    },
    {
      icon: Upload,
      title: "Smart File Upload",
      description:
        "Drop your messy CSV or Excel files and watch the magic happen. Our AI instantly analyzes your data structure.",
    },
    {
      icon: Bot,
      title: "AI-Powered Validation",
      description:
        "Advanced AI checks for errors, inconsistencies, and missing data. Get smart suggestions for fixing issues.",
    },
    {
      icon: CheckCircle,
      title: "Visual Data Grid",
      description:
        "Edit your data in an intuitive spreadsheet-like interface. Fix errors with one-click suggestions.",
    },
    {
      icon: Settings,
      title: "Natural Language Rules",
      description:
        "Create business rules by typing in plain English. No coding required – just describe what you need.",
    },
    {
      icon: Sliders,
      title: "Smart Prioritization",
      description:
        "Use intuitive sliders to balance cost, speed, and quality. See real-time impact of your choices.",
    },
    {
      icon: Download,
      title: "Export Ready Data",
      description:
        "Download clean CSV files and configured rules.json ready for your downstream allocation tools.",
    },
  ];

  const steps = [
    { number: "1", title: "Upload", description: "Drop your CSV/Excel files" },
    {
      number: "2",
      title: "Review",
      description: "AI validates and flags issues",
    },
    {
      number: "3",
      title: "Fix",
      description: "Edit data with smart suggestions",
    },
    {
      number: "4",
      title: "Configure",
      description: "Set rules in plain English",
    },
    { number: "5", title: "Export", description: "Download clean, ready data" },
  ];

  const FeatureCard = ({
    feature,
    index,
  }: {
    feature: (typeof features)[0];
    index: number;
  }) => (
    <Card className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-card via-card to-card/95 group min-w-[300px] mx-3 flex-shrink-0">
      <CardHeader>
        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 via-primary/15 to-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:from-primary/15 group-hover:via-primary/20 group-hover:to-primary/15 transition-all duration-300">
          <feature.icon className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent">
          {feature.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base leading-relaxed">
          {feature.description}
        </CardDescription>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-sm sticky top-0 z-50 w-full">
        <div className="w-[90%] lg:w-[80%] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10  rounded-lg flex items-center justify-center shadow-sm">
            <Bot className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Data Alchemist
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30"
            >
              How it Works
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <div className="w-[90%] lg:w-[80%] mx-auto">
        {/* Hero Section */}
        <section className="px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 via-primary/15 to-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary/20">
              <FileSpreadsheet className="w-4 h-4" />
              <span>AI-Powered Data Transformation</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent leading-tight">
              Forge Your Own AI Resource‑Allocation Configurator
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your chaotic spreadsheets into clean, validated data
              with AI. Upload messy CSV files, let our AI validate and suggest
              fixes, create rules in plain English, and export production-ready
              data.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                onClick={() => router.push("/upload")}
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all"
              >
                Get Started Free
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-lg px-8 py-6 border-2 hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/20"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16">
          {/* Features Wrapper with Dots Background */}
          <div className="md:w-4/5 w-11/12 mx-auto mt-10 h-auto relative bg-background py-10">
            {/* Dots Background */}
            <div
              className="absolute inset-0 dark:bg-[radial-gradient(#737373_1px,transparent_1px)] bg-[radial-gradient(#0c0c0c_1px,transparent_1px)] [background-size:16px_16px] opacity-50 z-0"
              aria-hidden="true"
            />

            {/* Edge Fades */}
            <div className="pointer-events-none absolute inset-0 z-20">
              {/* Top Fade */}
              <div className="absolute top-0 left-0 w-full h-[60px] bg-gradient-to-b from-background to-transparent" />
              {/* Bottom Fade */}
              <div className="absolute bottom-0 left-0 w-full h-[60px] bg-gradient-to-t from-background to-transparent" />
              {/* Left Fade */}
              <div className="absolute top-0 left-0 h-full w-[50px] bg-gradient-to-r from-background to-transparent" />
              {/* Right Fade */}
              <div className="absolute top-0 right-0 h-full w-[50px] bg-gradient-to-l from-background to-transparent" />
            </div>

            {/* Actual Content */}
            <div className="text-center mb-12 px-4">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground/95 to-foreground/80 bg-clip-text text-transparent">
                Powerful Features for Data Professionals
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to transform messy data into
                production-ready resources
              </p>
            </div>
            <div className="relative z-10 flex flex-col items-center overflow-hidden">
              {/* Top Row - Moving Right */}
              <div className="mb-8">
                <motion.div
                  className="flex w-max gap-6 relative z-0"
                  animate={{ x: ["-50%", "50%"] }}
                  transition={{
                    ease: "linear",
                    duration: 30,
                    repeat: Infinity,
                  }}
                >
                  {features.map((feature, i) => (
                    <Card
                      key={i}
                      className="w-[293px] flex-shrink-0 hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-primary/20 bg-gradient-to-br from-card via-card to-card/95 group"
                    >
                      <CardHeader>
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 via-primary/15 to-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:from-primary/15 group-hover:via-primary/20 group-hover:to-primary/15 transition-all duration-300">
                          <feature.icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Offer - Problem Statement Section */}
        <section className="px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground/95 to-foreground/80 bg-clip-text text-transparent">
              What We Offer
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              A comprehensive solution to the data chaos that plagues modern
              businesses
            </p>

            {/* Problem Statement Card */}
            <Card className="max-w-3xl mx-auto bg-gradient-to-br from-muted/20 via-muted/15 to-muted/10 border-muted/50 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mt-1 flex-shrink-0 shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-2xl mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      The Spreadsheet Chaos Problem
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                      Client lists scattered here, worker details there, and
                      task plans everywhere. Sound familiar? You're not alone in
                      this struggle.
                    </p>
                    <p className="text-foreground font-medium text-lg">
                      <strong className="text-primary">Data Alchemist</strong>{" "}
                      brings order to your data chaos with AI-powered
                      validation, intuitive editing, and smart rule creation –
                      transforming your messy spreadsheets into clean,
                      actionable business intelligence.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground/95 to-foreground/80 bg-clip-text text-transparent">
              Ready to Tame Your Data Chaos?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join the data professionals who've already transformed their
              workflows with AI-powered data processing.
            </p>
            <Button
              size="lg"
              onClick={() => router.push("/upload")}
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Start Your Data Transformation
              <FileCheck className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </div>

      {/* How It Works Section - Full Width Background */}
      <section
        id="how-it-works"
        className="bg-gradient-to-br from-muted/30 via-muted/20 to-muted/10 py-16 w-full"
      >
        <div className="w-[90%] lg:w-[80%] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground/95 to-foreground/80 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Five simple steps to transform your messy data into clean,
              actionable resources
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center max-w-xs"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-6 h-6 text-muted-foreground mt-4 lg:hidden" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Full Width Background */}
      <footer className="border-t bg-gradient-to-r from-muted/20 via-muted/15 to-muted/10 py-8 w-full">
        <div className="w-[90%] lg:w-[80%] mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Data Alchemist
            </span>
          </div>
          <p>
            &copy; 2024 Digitalyz. Transforming data chaos into organized
            success.
          </p>
        </div>
      </footer>
    </div>
  );
}
