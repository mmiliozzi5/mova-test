import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const resources = [
  {
    title: "Understanding Burnout: Signs and Recovery",
    description: "Learn to recognize the three stages of burnout — exhaustion, cynicism, and inefficacy — and practical steps to recover and prevent relapse.",
    url: "https://hbr.org/2019/12/burnout-is-about-your-workplace-not-your-people",
    type: "article",
    tags: ["burnout", "recovery", "mental-health"],
  },
  {
    title: "Setting Boundaries at Work",
    description: "A practical guide to communicating limits with colleagues and managers while maintaining professionalism and protecting your mental energy.",
    url: "https://www.mindful.org/setting-boundaries-at-work/",
    type: "article",
    tags: ["work-life-balance", "communication", "burnout"],
  },
  {
    title: "5-Minute Mindfulness Meditation for Busy Professionals",
    description: "A guided breathing and body scan meditation designed to fit into short breaks during the workday. No prior experience needed.",
    url: "https://www.youtube.com/watch?v=inpok4MKVLM",
    type: "video",
    tags: ["mindfulness", "anxiety", "stress-relief"],
  },
  {
    title: "How to Ask for a Promotion (Without Feeling Awkward)",
    description: "Step-by-step conversation framework for advocating for your career growth, including how to document impact and time the conversation.",
    url: "https://hbr.org/2021/01/how-to-ask-for-a-promotion",
    type: "article",
    tags: ["asking-for-promotion", "career", "communication"],
  },
  {
    title: "Navigating Difficult Job Interviews",
    description: "Evidence-based techniques for managing interview anxiety, handling tough questions, and presenting your authentic self under pressure.",
    url: "https://www.psychologytoday.com/us/blog/lifetime-connections/202003/managing-interview-anxiety",
    type: "article",
    tags: ["job-interviews", "anxiety", "career"],
  },
  {
    title: "Box Breathing: A Quick Stress Reset",
    description: "The same breathing technique used by Navy SEALs to stay calm under pressure. Practice this 4-count pattern before stressful meetings.",
    type: "tip",
    tags: ["anxiety", "mindfulness", "stress-relief"],
  },
  {
    title: "Work-Life Balance: Setting Digital Boundaries",
    description: "Practical strategies for disconnecting after hours, managing notification fatigue, and protecting personal time in a remote-first world.",
    url: "https://www.bbc.com/worklife/article/20200618-why-remote-work-blurs-the-line-between-home-and-office",
    type: "article",
    tags: ["work-life-balance", "burnout", "remote-work"],
  },
  {
    title: "The Science of Sleep and Job Performance",
    description: "Research-backed insights into how sleep quality affects decision-making, creativity, and emotional regulation — and how to improve your sleep hygiene.",
    url: "https://sleepeducation.org/sleep-caffeine/",
    type: "article",
    tags: ["burnout", "mental-health", "wellness"],
  },
  {
    title: "Preparing for a Performance Review",
    description: "How to frame accomplishments, address challenges honestly, and negotiate for what you deserve during annual or quarterly performance reviews.",
    type: "tip",
    tags: ["asking-for-promotion", "career", "communication"],
  },
  {
    title: "Managing Workplace Anxiety: A Therapist's Guide",
    description: "Clinical psychologist Dr. Ellen Hendriksen shares cognitive-behavioral techniques for social anxiety, perfectionism, and imposter syndrome at work.",
    url: "https://www.quietrevolution.com/2016/09/quietrev-social-anxiety-workplace/",
    type: "article",
    tags: ["anxiety", "mental-health", "work-life-balance"],
  },
  {
    title: "RAIN Meditation: Working with Difficult Emotions",
    description: "A four-step mindfulness practice — Recognize, Allow, Investigate, Nurture — to process difficult emotions without being overwhelmed by them.",
    url: "https://www.tarabrach.com/rain/",
    type: "article",
    tags: ["mindfulness", "anxiety", "mental-health"],
  },
  {
    title: "Job Interview Prep: The STAR Method",
    description: "How to structure compelling behavioral interview answers using Situation, Task, Action, Result — with examples from common workplace scenarios.",
    type: "tip",
    tags: ["job-interviews", "career", "communication"],
  },
  {
    title: "Combating Loneliness in Remote Work",
    description: "Remote workers are 25% more likely to feel isolated. This guide covers building connection, creating rituals, and knowing when to seek support.",
    url: "https://buffer.com/state-of-remote-work",
    type: "article",
    tags: ["work-life-balance", "mental-health", "remote-work"],
  },
  {
    title: "The 2-Minute Gratitude Practice",
    description: "Research shows that writing three specific things you're grateful for each morning measurably improves mood within 21 days. Here's how to start.",
    type: "tip",
    tags: ["mindfulness", "mental-health", "wellness"],
  },
  {
    title: "Handling Feedback Without Getting Defensive",
    description: "Learn to separate your identity from your work, ask clarifying questions, and use critical feedback as fuel rather than a source of shame.",
    url: "https://hbr.org/2014/01/find-the-coaching-in-criticism",
    type: "article",
    tags: ["communication", "career", "mental-health"],
  },
  {
    title: "Yoga for Desk Workers: 10-Minute Routine",
    description: "Gentle stretches to release tension in the neck, shoulders, and lower back accumulated from sitting at a desk. No mat or equipment required.",
    url: "https://www.youtube.com/watch?v=M-8FvC3GD8c",
    type: "video",
    tags: ["wellness", "stress-relief", "burnout"],
  },
  {
    title: "When Workplace Stress Becomes a Health Issue",
    description: "Recognize the difference between normal work stress and chronic stress that requires professional mental health support, and how to find help.",
    url: "https://www.nami.org/Your-Journey/Living-with-a-Mental-Health-Condition/Managing-Stress",
    type: "article",
    tags: ["burnout", "mental-health", "anxiety"],
  },
  {
    title: "Negotiating Salary: Scripts That Work",
    description: "Word-for-word conversation guides for asking for a raise or negotiating a job offer, including how to handle pushback confidently.",
    url: "https://hbr.org/2014/04/15-rules-for-negotiating-a-job-offer",
    type: "article",
    tags: ["asking-for-promotion", "career", "job-interviews"],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create sample organization with departments
  const org = await prisma.organization.upsert({
    where: { slug: "acme-corp" },
    update: {},
    create: {
      name: "Acme Corp",
      slug: "acme-corp",
    },
  });

  const depts = await Promise.all([
    prisma.department.upsert({
      where: { id: "dept-engineering" },
      update: {},
      create: { id: "dept-engineering", name: "Engineering", organizationId: org.id },
    }),
    prisma.department.upsert({
      where: { id: "dept-design" },
      update: {},
      create: { id: "dept-design", name: "Design", organizationId: org.id },
    }),
    prisma.department.upsert({
      where: { id: "dept-hr" },
      update: {},
      create: { id: "dept-hr", name: "Human Resources", organizationId: org.id },
    }),
    prisma.department.upsert({
      where: { id: "dept-sales" },
      update: {},
      create: { id: "dept-sales", name: "Sales", organizationId: org.id },
    }),
    prisma.department.upsert({
      where: { id: "dept-marketing" },
      update: {},
      create: { id: "dept-marketing", name: "Marketing", organizationId: org.id },
    }),
  ]);

  console.log(`✅ Organization: ${org.name} (slug: ${org.slug})`);
  console.log(`✅ Departments: ${depts.map((d) => d.name).join(", ")}`);

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@acme-corp.com" },
    update: {},
    create: {
      name: "Org Admin",
      email: "admin@acme-corp.com",
      hashedPassword: adminPassword,
      role: "ORG_ADMIN",
      organizationId: org.id,
    },
  });
  console.log(`✅ Admin: ${admin.email} / admin123!`);

  // Create sample employee
  const empPassword = await bcrypt.hash("employee123!", 12);
  const employee = await prisma.user.upsert({
    where: { email: "alex@acme-corp.com" },
    update: {},
    create: {
      name: "Alex Johnson",
      email: "alex@acme-corp.com",
      hashedPassword: empPassword,
      role: "EMPLOYEE",
      organizationId: org.id,
      departmentId: depts[0].id,
    },
  });
  console.log(`✅ Employee: ${employee.email} / employee123!`);

  // Seed resources
  await prisma.resource.deleteMany();
  await prisma.resource.createMany({ data: resources });
  console.log(`✅ ${resources.length} resources seeded`);

  console.log("\n🎉 Seed complete!");
  console.log("\nTest credentials:");
  console.log("  Admin:    admin@acme-corp.com / admin123!");
  console.log("  Employee: alex@acme-corp.com  / employee123!");
  console.log("  Org slug: acme-corp");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
