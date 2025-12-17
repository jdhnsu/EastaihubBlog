import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import { Layout, PostCard } from './renderer';
import content from './content.json';
import { Post, ContentManifest } from './types';

// Cast content to correct type
const manifest = content as unknown as ContentManifest;

const app = new Hono();

const POSTS_PER_PAGE = 5;

// Routes
app.get('/', (c) => {
  const page = 1;
  const posts = manifest.posts.slice(0, POSTS_PER_PAGE);
  const totalPages = Math.ceil(manifest.posts.length / POSTS_PER_PAGE);

  return c.html(
    <Layout title="首页">
      <div class="intro-banner">
        <h2>最新动态</h2>
        <p class="share-prompt"></p>
      </div>
      <div class="posts-list">
        {posts.map((post) => (
          <PostCard post={post} />
        ))}
      </div>
      {totalPages > 1 && (
        <div class="pagination">
          <span>第 {page} 页 / 共 {totalPages} 页</span>
          <a href="/page/2">下一页 &raquo;</a>
        </div>
      )}
    </Layout>
  );
});

app.get('/page/:page', (c) => {
  const page = parseInt(c.req.param('page')) || 1;
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;
  const posts = manifest.posts.slice(start, end);
  const totalPages = Math.ceil(manifest.posts.length / POSTS_PER_PAGE);

  if (posts.length === 0) return c.redirect('/');

  return c.html(
    <Layout title={`第 ${page} 页`}>
      <h2>归档 - 第 {page} 页</h2>
      <div class="posts-list">
        {posts.map((post) => (
          <PostCard post={post} />
        ))}
      </div>
      <div class="pagination">
        {page > 1 && <a href={`/page/${page - 1}`}>&laquo; 上一页</a>}
        <span> 第 {page} 页 / 共 {totalPages} 页 </span>
        {page < totalPages && <a href={`/page/${page + 1}`}>下一页 &raquo;</a>}
      </div>
    </Layout>
  );
});

app.get('/post/:slug', (c) => {
  const slug = c.req.param('slug');
  const post = manifest.posts.find((p) => p.slug === slug);

  if (!post) return c.notFound();

  return c.html(
    <Layout title={post.title} metaDescription={post.excerpt}>
      <article>
        <h2>{post.title}</h2>
        <div class="article-meta">
            发布于: {new Date(post.date).toLocaleDateString()}
            {post.tags && (
                <span> | 标签: {post.tags.map(t => <a href={`/tag/${t}`}>{t}</a>)}</span>
            )}
        </div>
        {post.featured_image && (
            <img src={post.featured_image} alt={post.title} style="max-width: 100%; margin: 1em 0;" />
        )}
        <div class="article-content" dangerouslySetInnerHTML={{ __html: post.content }}></div>
      </article>

      <div class="comments-section">
        <h3>讨论区</h3>
        <p class="comment-prompt">请发表与主题相关的专业讨论</p>
        <div class="comment-placeholder" style="background: #f9f9f9; padding: 20px; border: 1px dashed #ccc; text-align: center; color: #777;">
           (评论功能开发中...)
        </div>
      </div>
    </Layout>
  );
});

app.get('/tag/:tag', (c) => {
  const tag = c.req.param('tag');
  const slugs = manifest.tags[tag] || [];
  const posts = manifest.posts.filter((p) => slugs.includes(p.slug));

  return c.html(
    <Layout title={`标签: ${tag}`}>
      <h2>标签 "{tag}" 下的文章</h2>
      <div class="posts-list">
        {posts.map((post) => (
          <PostCard post={post} />
        ))}
      </div>
    </Layout>
  );
});

app.get('/tags', (c) => {
    const tags = Object.keys(manifest.tags);
    return c.html(
        <Layout title="所有标签">
            <h2>所有标签</h2>
            <ul>
                {tags.map(tag => (
                    <li><a href={`/tag/${tag}`}>{tag} ({manifest.tags[tag].length})</a></li>
                ))}
            </ul>
        </Layout>
    );
});

app.get('/search', (c) => {
  const query = c.req.query('q')?.toLowerCase() || '';
  const posts = manifest.posts.filter(p => 
    p.title.toLowerCase().includes(query) || 
    p.excerpt.toLowerCase().includes(query) ||
    p.tags.some(t => t.toLowerCase().includes(query))
  );

  return c.html(
    <Layout title={`搜索: ${query}`}>
      <h2>"{query}" 的搜索结果</h2>
      {posts.length === 0 ? (
        <p>没有找到相关文章。</p>
      ) : (
        <div class="posts-list">
          {posts.map((post) => (
            <PostCard post={post} />
          ))}
        </div>
      )}
    </Layout>
  );
});

export default app;
