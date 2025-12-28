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
      {/* <div class="intro-banner">
        <h2>最新动态</h2>
        <p class="share-prompt"> </p>
      </div> */}
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

      {/* <div class="comments-section">
        <h3>讨论区</h3>
        <p class="comment-prompt">请发表与主题相关的专业讨论</p>
        <div class="comment-placeholder" style="background: #f9f9f9; padding: 20px; border: 1px dashed #ccc; text-align: center; color: #777;">
           (评论功能开发中...)
        </div>
      </div> */}
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

app.get('/links', (c) => {
    // 分类链接数据
    const linkCategories = [
      { name: 'Eastaihub 实验室资源',
        links: [
          { name: 'AI 抠图工具', url: 'https://demo.eastaihub.cloud/', description: 'Eastaihub 提供的 AI 抠图工具' },
          { name: '文件转换服务器', url: 'https://tool.eastaihub.cloud/', description: 'Eastaihub 提供的文件转换服务器' },
        ]
     
      },

 
        {
            name: '开发工具',
            links: [
                { name: 'VS Code', url: 'https://code.visualstudio.com/', description: '强大的代码编辑器' },
                { name: 'GitHub', url: 'https://github.com/', description: '代码托管平台' },
                { name: 'Figma', url: 'https://www.figma.com/', description: '协作设计工具' },
                {name: 'PyCharm',url: 'https://www.jetbrains.com/zh-cn/pycharm/' , description: 'Python 开发工具'},
                {name: 'Jupyter Notebook',url: 'https://jupyter.org/', description: '交互式计算环境'},
                {name: 'Docker',url: 'https://www.docker.com/', description: '容器化平台'},
            ]
        },
        {
            name: '学习资源',
            links: [
                { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/', description: 'Web开发文档' },
                { name: 'GitHub Learning Lab', url: 'https://lab.github.com/', description: 'GitHub学习平台' },
                { name: 'Coursera', url: 'https://www.coursera.org/', description: '在线课程平台' },
                 {name: '计算机基础课程', url:'https://missing-semester-cn.github.io/',description: '课程学习材料'}
            ]
        },
        {
            name: '项目链接',
            links: [
                { name: 'Hono', url: 'https://hono.dev/', description: '轻量级Web框架' },
                { name: 'Cloudflare Workers', url: 'https://workers.cloudflare.com/', description: '无服务器平台' },
                { name: 'TypeScript', url: 'https://www.typescriptlang.org/', description: 'JavaScript超集' },
               
            ]
        },

        { 
        name: "学校官方资源",
        links: [
        {name: "学校官方网站", url: 'https://nsu.edu.cn/', description: "NSU CNU 学校官方网站"},
        {name: 'NSU 教育邮箱使用', url: 'https://stu.nsu.edu.cn/', description: 'NSU 教育邮箱使用说明'}
        ]
      },

    ];

    return c.html(
        <Layout title="链接资源">
            <h2>链接资源</h2>
            <p>这里收集了各类开发工具、学习资源和项目链接，方便大家浏览和使用。</p>
            
            <div class="links-container">
                {linkCategories.map((category, index) => (
                    <div class="link-category" key={index}>
                        <h3>{category.name}</h3>
                        <div class="link-cards">
                            {category.links.map((link, linkIndex) => (
                                <div class="link-card" key={linkIndex}>
                                    <div class="link-header">
                                        <h4><a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a></h4>
                                        <button class="preview-btn" data-url={link.url} data-name={link.name} onclick="openPreview(this.dataset.url, this.dataset.name)">预览</button>
                                    </div>
                                    <p class="link-description">{link.description}</p>
                                    <div class="link-url">
                                        <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* 链接预览模态框 */}
            <div id="link-preview-modal" class="modal">
                <div class="modal-content">
                    <span class="close" onclick="closePreview()">&times;</span>
                    <h3 id="preview-title"></h3>
                    <div class="preview-container">
                        <iframe id="preview-iframe" src="" frameborder="0"></iframe>
                    </div>
                </div>
            </div>

            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        function openPreview(url, title) {
                            document.getElementById('preview-title').textContent = title;
                            document.getElementById('preview-iframe').src = url;
                            document.getElementById('link-preview-modal').style.display = 'block';
                        }

                        function closePreview() {
                            document.getElementById('link-preview-modal').style.display = 'none';
                            document.getElementById('preview-iframe').src = '';
                        }

                        window.onclick = function(event) {
                            const modal = document.getElementById('link-preview-modal');
                            if (event.target == modal) {
                                closePreview();
                            }
                        }
                    `
                }}
            />
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
