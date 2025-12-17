import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

// Define types locally to avoid ts-node import resolution issues
interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
  featured_image?: string;
}

interface ContentManifest {
  posts: Post[];
  tags: Record<string, string[]>;
}

const MD_DIR = path.join(process.cwd(), 'md');
const IMAGES_DIR = path.join(MD_DIR, 'image');
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public/image');
const OUTPUT_FILE = path.join(process.cwd(), 'src/content.json');

// Ensure output directory exists
if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
}

// Ensure public images directory exists
if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
  fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
}

async function buildContent() {
  console.log('Building content from:', MD_DIR);
  
  // Copy images
  if (fs.existsSync(IMAGES_DIR)) {
    console.log('Copying images...');
    const images = fs.readdirSync(IMAGES_DIR);
    for (const image of images) {
      fs.copyFileSync(path.join(IMAGES_DIR, image), path.join(PUBLIC_IMAGES_DIR, image));
    }
  }

  if (!fs.existsSync(MD_DIR)) {
    console.error('Markdown directory not found!');
    process.exit(1);
  }

  const files = fs.readdirSync(MD_DIR);
  const posts: Post[] = [];
  const tagsMap: Record<string, string[]> = {};

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const filePath = path.join(MD_DIR, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) continue;

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse Front Matter
    const { data, content } = matter(fileContent);
    
    // Generate HTML
    const htmlContent = await marked.parse(content);
    
    // Fix image paths: ./image/ -> /image/
    const fixedHtmlContent = htmlContent.replace(/src="\.\/image\//g, 'src="/image/');

    // Generate slug from filename or title
    const slug = path.basename(file, '.md');

    // Process tags
    const tags = data.tags ? (typeof data.tags === 'string' ? [data.tags] : data.tags) : [];
    
    tags.forEach((tag: string) => {
      if (!tagsMap[tag]) tagsMap[tag] = [];
      tagsMap[tag].push(slug);
    });

    // Create Post object
    let featured_image = data.featured_image || data.cover || data.top_img;
    if (featured_image && featured_image.startsWith('./image/')) {
      featured_image = featured_image.replace('./image/', '/image/');
    }

    const post: Post = {
      slug,
      title: data.title || slug,
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      tags: tags,
      excerpt: data.excerpt || content.substring(0, 200).replace(/[#*`]/g, '') + '...',
      content: fixedHtmlContent,
      featured_image: featured_image
    };

    posts.push(post);
  }

  // Sort posts by date (newest first)
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const manifest: ContentManifest = {
    posts,
    tags: tagsMap
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  console.log(`Generated content.json with ${posts.length} posts.`);
}

buildContent().catch(console.error);
