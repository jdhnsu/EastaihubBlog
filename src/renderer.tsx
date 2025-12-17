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
      </body>
    </html>
  );
};

export const PostCard = ({ post }: { post: any }) => (
  <div class="post-card">
    <h3><a href={`/post/${post.slug}`}>{post.title}</a></h3>
    <div class="meta">
        <span class="date">{new Date(post.date).toLocaleDateString()}</span>
        {post.tags && post.tags.length > 0 && (
            <span class="tags"> | Tags: {post.tags.join(', ')}</span>
        )}
    </div>
    <p>{post.excerpt}</p>
  </div>
);
