import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';

async function getAdminPosts() {
  try {
    await dbConnect();
    
    const posts = await BlogPost.find()
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function AdminPostsPage() {
  const posts = await getAdminPosts();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
        <Link 
          href="/admin/posts/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          Add New Post
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Posts</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {posts.length > 0 ? (
            posts.map((post: any) => (
              <div key={post._id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {post.title?.en || 'Untitled'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Status: <span className={`font-medium ${post.status === 'published' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {post.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Updated: {new Date(post.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Link 
                    href={`/admin/posts/${post._id}`}
                    className="text-primary-600 hover:text-primary-700 px-3 py-1 border border-primary-600 rounded text-sm"
                  >
                    Edit
                  </Link>
                  {post.status === 'published' && (
                    <Link 
                      href={`/apps/${post.slug}.html`}
                      target="_blank"
                      className="text-gray-600 hover:text-gray-700 px-3 py-1 border border-gray-600 rounded text-sm"
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No posts yet.</p>
              <Link 
                href="/admin/posts/new"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Create your first post
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 