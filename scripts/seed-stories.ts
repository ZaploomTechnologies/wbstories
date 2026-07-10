import mongoose from "mongoose";
import { StoryModel } from "../src/models/story.model";
import { slugify } from "../src/utils/slugify.util";
import { sanitizeHtml } from "../src/services/sanitize.service";
import { calculateReadingTime } from "../src/services/reading-time.service";
import { firstImageUrl } from "../src/helpers/text.helper";

interface SeedStory {
  title: string;
  content: string;
  status: "draft" | "published";
  daysAgo: number;
}

// No banner image is embedded here — local uploads live under public/uploads,
// which isn't pre-populated, so seeded stories intentionally render without
// one (bannerImage stays undefined, matching how the editor derives it from
// the content's first <img>, if any).
const SAMPLE_STORIES: SeedStory[] = [
  {
    title: "How a Small Bakery Scaled to Ten Cities in Two Years",
    content: `
      <p>When Maria Chen opened her first bakery in a converted garage, she never imagined it would become a ten-city operation within two years.</p>
      <h2>Starting Small</h2>
      <p>The first location ran on a single oven and a handful of recipes passed down through three generations.</p>
      <blockquote>"We never set out to franchise. We just wanted to make good bread." — Maria Chen, Founder</blockquote>
      <h2>The Turning Point</h2>
      <ul>
        <li>A viral social media post about their sourdough</li>
        <li>A partnership with a regional grocery chain</li>
        <li>A decision to standardize recipes for consistency</li>
      </ul>
      <p>Today, the company operates in ten cities with plans to double that number by next year.</p>
    `,
    status: "published",
    daysAgo: 2,
  },
  {
    title: "The Rise of Remote-First Manufacturing Teams",
    content: `
      <p>Remote work reshaped software, marketing, and finance. Manufacturing was thought to be immune — until it wasn't.</p>
      <h2>Remote Oversight, Local Execution</h2>
      <p>Modern IoT sensors and camera systems now let plant managers oversee production lines from anywhere in the world.</p>
      <h3>Key technologies driving the shift</h3>
      <ol>
        <li>Real-time telemetry dashboards</li>
        <li>Predictive maintenance algorithms</li>
        <li>Remote-controlled quality assurance stations</li>
      </ol>
      <p>Early adopters report a 15% reduction in on-site staffing costs without any drop in output quality.</p>
    `,
    status: "published",
    daysAgo: 5,
  },
  {
    title: "Inside the Acquisition That Reshaped a Local Logistics Market",
    content: `
      <p>When Northline Logistics announced its acquisition of rival Fenwick Freight, few expected regulators to approve it so quickly.</p>
      <h2>Why the Deal Made Sense</h2>
      <p>Both companies shared overlapping routes but complementary strengths — Northline's warehousing network paired well with Fenwick's last-mile fleet.</p>
      <table>
        <thead><tr><th>Metric</th><th>Before</th><th>After</th></tr></thead>
        <tbody>
          <tr><td>Delivery routes</td><td>120</td><td>210</td></tr>
          <tr><td>Average delivery time</td><td>2.4 days</td><td>1.6 days</td></tr>
        </tbody>
      </table>
      <p>Customers have already started noticing faster turnaround times across the region.</p>
    `,
    status: "published",
    daysAgo: 9,
  },
  {
    title: "Why This Fintech Startup Walked Away From a $40M Term Sheet",
    content: `
      <p>Most founders dream of a term sheet like the one Larkspur Finance turned down last spring.</p>
      <h2>The Fine Print</h2>
      <p>Buried in the offer were governance terms that would have handed control of product decisions to the lead investor.</p>
      <blockquote>"We built this company to move slowly and carefully with people's money. That clause would have forced us to move fast and break things instead." — Dev Patel, Co-founder</blockquote>
      <p>Six months later, Larkspur closed a smaller round on its own terms — with the governance structure intact.</p>
    `,
    status: "published",
    daysAgo: 14,
  },
  {
    title: "A Family Hardware Store's Fourth-Generation Pivot to E-Commerce",
    content: `
      <p>Founded in 1934, Bishop Hardware had survived depressions, recessions, and three big-box competitors moving in nearby.</p>
      <h2>Digital, Finally</h2>
      <p>It took a pandemic to push the fourth-generation owners to finally build an online storefront.</p>
      <ul>
        <li>Same-day local delivery within a 10-mile radius</li>
        <li>A video consultation service for DIY projects</li>
        <li>Inventory synced in real time across the website and store</li>
      </ul>
      <p>Online orders now account for nearly a third of total revenue — a number nobody at Bishop Hardware expected two years ago.</p>
    `,
    status: "published",
    daysAgo: 20,
  },
  {
    title: "Draft: Exploring a Merger With Our Regional Competitor",
    content: `
      <p>This is a draft story used to demonstrate the admin panel's draft/published workflow.</p>
      <p>It should only be visible in the admin story list, not on the public site.</p>
    `,
    status: "draft",
    daysAgo: 0,
  },
];

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI must be set in .env.local.");
  }

  await mongoose.connect(mongoUri);

  for (const sample of SAMPLE_STORIES) {
    const existing = await StoryModel.findOne({ title: sample.title });
    if (existing) {
      console.log(`Skipping "${sample.title}" — already seeded.`);
      continue;
    }

    const baseSlug = slugify(sample.title.replace(/^Draft:\s*/, ""));
    let slug = baseSlug;
    let suffix = 0;
    while (await StoryModel.exists({ slug })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const content = sanitizeHtml(sample.content.trim());
    const readingTime = calculateReadingTime(content);
    const publishedAt =
      sample.status === "published"
        ? new Date(Date.now() - sample.daysAgo * 24 * 60 * 60 * 1000)
        : null;
    const imageUrl = firstImageUrl(content);

    await StoryModel.create({
      title: sample.title,
      slug,
      bannerImage: imageUrl ? { url: imageUrl } : undefined,
      content,
      status: sample.status,
      publishedAt,
      readingTime,
      isDeleted: false,
    });

    console.log(`Created "${sample.title}" (${sample.status}).`);
  }

  await mongoose.disconnect();
}

main().catch((error: unknown) => {
  console.error("Failed to seed stories:", error);
  process.exit(1);
});
