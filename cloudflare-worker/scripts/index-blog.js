#!/usr/bin/env node
/**
 * Blog Indexing Script for RAG (Batch Processing)
 * Usage: ADMIN_TOKEN=your_token node scripts/index-blog.js
 */

const fs = require('fs');
const path = require('path');

const API_ENDPOINT = 'https://gemini-proxy-with-logging.kimtoma.workers.dev';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('Error: ADMIN_TOKEN environment variable is required');
  process.exit(1);
}

const BLOG_DIR = path.join(__dirname, '../../_posts');
const LLMS_FILE = path.join(__dirname, '../../llms-full.txt');

/**
 * Parse Jekyll front matter and content from markdown file
 */
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!fmMatch) {
    return null;
  }

  const frontMatter = fmMatch[1];
  const body = fmMatch[2].trim();

  // Parse front matter
  const titleMatch = frontMatter.match(/title:\s*(.+)/);
  const title = titleMatch ? titleMatch[1].trim().replace(/^["']|["']$/g, '') : 'Untitled';

  // Get slug from filename
  const filename = path.basename(filePath, '.md');
  const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  const date = dateMatch ? dateMatch[1] : '';
  const slug = dateMatch ? dateMatch[2] : filename;

  return {
    title,
    slug,
    date,
    content: body,
  };
}

/**
 * Index blog posts with batch processing
 */
async function indexBlogPosts() {
  console.log('Reading blog posts from:', BLOG_DIR);

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  console.log(`Found ${files.length} blog posts`);

  const posts = [];
  for (const file of files) {
    const post = parseMarkdownFile(path.join(BLOG_DIR, file));
    if (post && post.content.length > 50) {
      posts.push(post);
      console.log(`  - ${post.title} (${post.date})`);
    }
  }

  console.log(`\nParsed ${posts.length} valid posts`);

  // Read llms-full.txt
  let llmsContent = '';
  if (fs.existsSync(LLMS_FILE)) {
    llmsContent = fs.readFileSync(LLMS_FILE, 'utf-8');
    console.log(`Read llms-full.txt (${llmsContent.length} chars)`);
  }

  // Process in batches
  console.log('\nIndexing in batches...');
  let batchIndex = 0;
  let totalIndexed = 0;

  while (true) {
    process.stdout.write(`  Batch ${batchIndex + 1}... `);

    const response = await fetch(`${API_ENDPOINT}/admin/index-blog`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        posts,
        llms_content: batchIndex === 0 ? llmsContent : undefined,
        batch_index: batchIndex,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`\n❌ Batch ${batchIndex + 1} failed:`, result.error);
      process.exit(1);
    }

    totalIndexed += result.indexed_count || 0;
    console.log(`indexed ${result.indexed_count} chunks`);

    if (!result.has_more) {
      break;
    }

    batchIndex++;
    // Small delay between batches
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n✅ Indexing complete!`);
  console.log(`   Total vectors indexed: ${totalIndexed}`);
}

/**
 * Check RAG stats
 */
async function checkStats() {
  const response = await fetch(`${API_ENDPOINT}/admin/rag-stats`, {
    headers: {
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
  });

  const stats = await response.json();
  console.log('\n📊 RAG Stats:');
  console.log(`   Index: ${stats.index_name}`);
  console.log(`   Vectors: ${stats.vector_count}`);
  console.log(`   Dimensions: ${stats.dimensions}`);
}

// Main
(async () => {
  try {
    await indexBlogPosts();
    await checkStats();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
