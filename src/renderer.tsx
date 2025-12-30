import { html } from 'hono/html';
import { jsx } from 'hono/jsx';

interface LayoutProps {
  title?: string;
  children: any;
  metaDescription?: string;
  showSidebar?: boolean;
}

export const Layout = (props: LayoutProps) => {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{props.title ? `${props.title} - CNU AI Game Lab` : 'CNU学院人工智能游戏实验室(Eastaihub)'}</title>
        <meta name="description" content={props.metaDescription || "探索AI与游戏开发的创新融合"} />
        <link rel="stylesheet" href="/style.css" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
      </head>
      <body>
        <div id="heaptop">
          <div id="mission-statement">欢迎来到AI游戏实验室博客</div>
        </div>
        <header id="header">
          <div className="header-inner">
            <div className="logo-text">
              <h1><a href="/">CNU学院人工智能游戏实验室(Eastaihub)</a></h1>
              <p className="subtitle">探索AI与游戏开发的创新融合</p>
            </div>
          </div>
        </header>

        <div id="navigation">
          <ul>
            <li><a href="/">首页</a></li>
            <li><a href="/tags">分类标签</a></li>
            <li><a href="/links">链接资源</a></li>
            {/* <li><a href="#">关于实验室</a></li>
                <li><a href="#">项目展示</a></li> */}
          </ul>
        </div>

        <div id="main-container">
          <div id="content">
            {props.children}
          </div>

          <aside id="sidebar">
            <div className="sidebar-module">
              <form action="/search" method="get" className="search-form">
                <input type="text" name="q" placeholder="搜索AI/游戏开发相关内容" />
                <button type="submit">搜索</button>
              </form>
            </div>

            <div className="sidebar-module">
              <h3>实验室简介</h3>
              <p>CNU学院eastaihub人工智能游戏实验室致力于探索人工智能技术在游戏开发中的前沿应用。我们关注生成式AI、强化学习代理以及智能NPC行为设计。</p>
            </div>

            <div className="sidebar-module">
              <h3>联系我们</h3>
              <p>Email: Jdhuan@eastaihub.cloud</p>
              {/* <p>Github: eastaihub</p> */}
            </div>
          </aside>
        </div>

        <div id="footer">
          <p>
            &copy; 2025 CNU学院eastaihub人工智能游戏实验室 版权所有。<br />
            {/* 未经授权，禁止转载。 */}
          </p>
          <p>Generated with Cloudflare Workers & Hono.</p>
        </div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
        <script
          async
          defer
          src="https://aichat.eastaihub.cloud/chat/api/embed?protocol=https&host=aichat.eastaihub.cloud&token=2df6df61cf63e957">
        </script>

      </body>
    </html>
  );
};

const DEFAULT_COVER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23aaa'%3ECover%3C/text%3E%3C/svg%3E";

export const PostCard = ({ post }: { post: any }) => (
  <div class="post-card">
    {post.featured_image && (
      <div class="post-cover">
        <img
          src={post.featured_image}
          alt={post.title}
          loading="lazy"
          width="200"
          height="200"
          onError={`this.onerror=null;this.src='${DEFAULT_COVER}';`}
        />
      </div>
    )}
    <div class="post-content">
      <h3><a href={`/post/${post.slug}`}>{post.title}</a></h3>
      <div class="meta">
        <span class="date">{new Date(post.date).toLocaleDateString()}</span>
        {post.tags && post.tags.length > 0 && (
          <span class="tags"> | Tags: {post.tags.join(', ')}</span>
        )}
      </div>
      <p>{post.excerpt}</p>
    </div>
  </div>
);