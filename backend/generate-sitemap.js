const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const BASE_URL = "https://geniuspreptuition.com";

// Validate environment
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error("❌ Error: SUPABASE_URL and SUPABASE_KEY are required in .env");
  process.exit(1);
}

async function generateSitemap() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );

    // 1. Fetch approved and active tutors
    const { data: tutors, error } = await supabase
      .from("tutor_profiles")
      .select("id, updated_at")
      .eq("approval_status", "approved")
      .eq("availability_status", "active");

    if (error) throw new Error(`Supabase Error: ${error.message}`);

    // 2. Define static URLs
    const staticLinks = [
      {
        url: "/",
        lastmod: new Date().toISOString().split("T")[0],
        priority: 1.0,
        changefreq: "daily",
      },
      {
        url: "/tutors",
        lastmod: new Date().toISOString().split("T")[0],
        priority: 0.9,
        changefreq: "weekly",
      },
      {
        url: "/gpa",
        lastmod: new Date().toISOString().split("T")[0],
        priority: 0.8,
        changefreq: "monthly",
      },
      {
        url: "/subscription",
        lastmod: new Date().toISOString().split("T")[0],
        priority: 0.8,
        changefreq: "monthly",
      },
      {
        url: "/login",
        lastmod: new Date().toISOString().split("T")[0],
        priority: 0.7,
        changefreq: "yearly",
      },
      {
        url: "/register",
        lastmod: new Date().toISOString().split("T")[0],
        priority: 0.7,
        changefreq: "yearly",
      },
    ];

    // 3. Build dynamic tutor URLs
    const dynamicLinks = (tutors || []).map((tutor) => ({
      url: `/tutors/${tutor.id}`,
      lastmod: new Date(tutor.updated_at).toISOString().split("T")[0],
      priority: 0.8,
      changefreq: "weekly",
    }));

    // 4. Generate XML string manually
    const allLinks = [...staticLinks, ...dynamicLinks];
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    allLinks.forEach((link) => {
      xml += "  <url>\n";
      xml += `    <loc>${BASE_URL}${link.url}</loc>\n`;
      if (link.lastmod) {
        xml += `    <lastmod>${link.lastmod}</lastmod>\n`;
      }
      xml += `    <changefreq>${link.changefreq}</changefreq>\n`;
      xml += `    <priority>${link.priority}</priority>\n`;
      xml += "  </url>\n";
    });

    xml += "</urlset>";

    // 5. Ensure frontend/public directory exists
    const frontendPublicDir = path.join(__dirname, "../frontend/public");
    if (!fs.existsSync(frontendPublicDir)) {
      fs.mkdirSync(frontendPublicDir, { recursive: true });
      console.log(`📁 Created directory: ${frontendPublicDir}`);
    }

    // 6. Write sitemap.xml
    const sitemapPath = path.join(frontendPublicDir, "sitemap.xml");
    fs.writeFileSync(sitemapPath, xml);

    console.log(`
✅ Sitemap generated successfully!
📍 Location: ${sitemapPath}
📊 Total URLs: ${allLinks.length}
   - Static routes: ${staticLinks.length}
   - Dynamic tutor profiles: ${dynamicLinks.length}
🌐 Base URL: ${BASE_URL}
    `);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error generating sitemap:", error.message);
    process.exit(1);
  }
}

generateSitemap();
