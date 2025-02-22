"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import {
  Brain,
  Code,
  FlaskRoundIcon as Flask,
  Gamepad2,
  GraduationCap,
  Heart,
  Lightbulb,
  Rocket,
  Star,
  Tv,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const MotionCard = motion(Card)

const skills = [
  {
    category: "Programming",
    items: [
      { name: "TypeScript", level: 90 },
      { name: "React", level: 85 },
      { name: "Python", level: 80 },
      { name: "Rust", level: 70 },
    ],
  },
  {
    category: "Research",
    items: [
      { name: "Machine Learning", level: 75 },
      { name: "Data Analysis", level: 85 },
      { name: "Algorithm Design", level: 80 },
    ],
  },
  {
    category: "Creative",
    items: [
      { name: "UI/UX Design", level: 75 },
      { name: "Digital Art", level: 70 },
      { name: "Technical Writing", level: 85 },
    ],
  },
]

const timeline = [
  {
    year: "2020",
    title: "The Beginning",
    description: "Started the journey into the world of programming and anime.",
    icon: Star,
  },
  {
    year: "2021",
    title: "First Research Project",
    description: "Conducted research on AI-powered animation generation.",
    icon: Brain,
  },
  {
    year: "2022",
    title: "Ahoge Lab Launch",
    description: "Created this space to share knowledge and experiences.",
    icon: Rocket,
  },
  {
    year: "2023",
    title: "Community Growth",
    description: "Built a community of like-minded developers and anime fans.",
    icon: Heart,
  },
  {
    year: "2024",
    title: "New Adventures",
    description: "Exploring new technologies and creative possibilities.",
    icon: Lightbulb,
  },
]

export default function AboutPage() {
  const timelineRef = useRef(null)
  const isInView = useInView(timelineRef, { once: true })

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-background dark:from-pink-950/20">
      {/* Hero Section */}
      <section className="container py-12 md:py-24">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Hi, I&apos;m{" "}
                <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                  Ahoge Hakase
                </span>
              </h1>
              <p className="mt-4 text-xl text-muted-foreground">
                A curious researcher, programmer, and anime enthusiast with an ahoge that points towards adventure! 🌟
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <Badge variant="secondary" className="gap-1">
                <Code className="h-3 w-3" /> Developer
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Flask className="h-3 w-3" /> Researcher
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Tv className="h-3 w-3" /> Anime Fan
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Gamepad2 className="h-3 w-3" /> Gamer
              </Badge>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative mx-auto aspect-square w-full max-w-md"
          >
            <Image src="/placeholder.svg" alt="Ahoge Hakase" fill className="object-contain" priority />
          </motion.div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="container py-12">
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-muted/50 p-8"
        >
          <div className="relative z-10">
            <p className="text-xl font-medium italic md:text-2xl">
              &ldquo;In the intersection of technology and creativity, we find the most fascinating discoveries.
              Let&apos;s explore them together!&rdquo;
            </p>
            <p className="mt-4 text-right text-muted-foreground">— Ahoge Hakase</p>
          </div>
          <div className="absolute right-0 top-0 h-32 w-32 rotate-12 transform opacity-10">
            <GraduationCap className="h-full w-full" />
          </div>
        </MotionCard>
      </section>

      {/* Timeline Section */}
      <section ref={timelineRef} className="container space-y-8 py-12 md:py-24">
        <h2 className="text-3xl font-bold">My Journey</h2>
        <div className="relative space-y-8">
          <div className="absolute left-[21px] top-3 h-full w-px bg-border md:left-1/2" />
          {timeline.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className={`relative flex flex-col gap-3 md:flex-row ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}
              >
                <div className={`flex flex-1 flex-col gap-2 ${index % 2 === 0 ? "md:text-right" : ""}`}>
                  <div className="flex items-center gap-2 md:justify-start">
                    <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border bg-background shadow-sm md:hidden">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-semibold">{item.year}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                <div className="hidden md:block">
                  <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border bg-background shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-1" />
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Skills Section */}
      <section className="container py-12 md:py-24">
        <h2 className="mb-8 text-3xl font-bold">Skills & Interests</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {skills.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold">{category.category}</h3>
              <div className="space-y-4">
                {category.items.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{skill.name}</span>
                      <span className="text-muted-foreground">{skill.level}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}

