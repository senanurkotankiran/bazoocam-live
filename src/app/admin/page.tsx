import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';

async function getDashboardStats() {
  try {
    await dbConnect();
    
    const totalPosts = await BlogPost.countDocuments();
    const publishedPosts = await BlogPost.countDocuments({ status: 'published' });
    const draftPosts = await BlogPost.countDocuments({ status: 'draft' });
    
    const recentPosts = await BlogPost.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      recentPosts: JSON.parse(JSON.stringify(recentPosts))
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      recentPosts: []
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Posts</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.totalPosts}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Published</h3>
          <p className="text-3xl font-bold text-green-600">{stats.publishedPosts}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Drafts</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.draftPosts}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/admin/posts/new"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Create New Post
          </Link>
          <Link 
            href="/admin/posts"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Manage Posts
          </Link>
          <Link 
            href="/admin/categories"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Manage Categories
          </Link>
          <Link 
            href="/admin/page-seo"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Manage Page SEO
          </Link>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
        <div className="space-y-4">
          {stats.recentPosts.map((post: any) => (
            <div key={post._id} className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">{post.title?.en || 'Untitled'}</h3>
                <p className="text-sm text-gray-500">
                  Status: {post.status} | Updated: {new Date(post.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <Link 
                href={`/admin/posts/${post._id}`}
                className="text-primary-600 hover:text-primary-700"
              >
                Edit
              </Link>
            </div>
          ))}
          
          {stats.recentPosts.length === 0 && (
            <p className="text-gray-500 text-center py-8">No posts yet</p>
          )}
        </div>
      </div>
    </div>
  );
} 