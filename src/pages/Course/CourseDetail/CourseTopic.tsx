import React, { useState, useEffect } from 'react';
import { getCoursePosts, getPendingPosts, createPost, updatePost, deletePost, approvePost } from '@/api/topicApi';
import type { Post } from '@/api/topicApi';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PostItem from '@/components/Course/CourseTopic/PostItem';
import NewPostForm from '@/components/Course/CourseTopic/NewPostForm';
import EmptyPost from '@/assets/empty_post.svg';
import AllApprove from '@/assets/all_approve.svg';
import { toast, ToastContainer } from 'react-toastify';
import { ConfirmationDialog } from '@/components/Common/ConfirmationDialog';
import { getCourseById, type Course } from '@/api/courseApi';

const CourseTopic: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<'community' | 'pending'>('community');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  // Pagination states
  const [communityPage, setCommunityPage] = useState(0);
  const [pendingPage, setPendingPage] = useState(0);
  const [communityHasMore, setCommunityHasMore] = useState(true);
  const [pendingHasMore, setPendingHasMore] = useState(true);

  // Get course data
  const fetchCourse = async () => {
    const response = await getCourseById(id || '');
    setCourse(response);
  };
  useEffect(() => {
    fetchCourse();
  }, []);

  // Fetch initial posts
  const fetchInitialPosts = async () => {
    if (!course) return;

    setIsLoading(true);
    try {
      if (activeTab === 'community') {
        const response = await getCoursePosts(course.id, 0, 10);
        setPosts(response.posts);

        setCommunityPage(0);
        setCommunityHasMore(response.currentPage < response.totalPages - 1);
      } else if (activeTab === 'pending') {
        const response = await getPendingPosts(course.id, 0, 10);
        setPendingPosts(response.posts);

        setPendingPage(0);
        setPendingHasMore(response.currentPage < response.totalPages - 1);
      }
    } catch (error) {
      setPosts([]);
      setPendingPosts([]);

      console.error('Error fetching posts:', error);
      toast.error('Lỗi khi tải bài viết');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (course) {
      fetchInitialPosts();
    }
  }, [course, activeTab]);

  const loadMorePosts = async () => {
    if (!course?.id || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      if (activeTab === 'community' && communityHasMore) {
        const nextPage = communityPage + 1;
        const response = await getCoursePosts(course.id, nextPage, 10);
        setPosts(prev => [...prev, ...response.posts]);
        setCommunityPage(nextPage);
        setCommunityHasMore(response.currentPage < response.totalPages - 1);
      } else if (activeTab === 'pending' && pendingHasMore) {
        const nextPage = pendingPage + 1;
        const response = await getPendingPosts(course.id, nextPage, 10);
        setPendingPosts(prev => [...prev, ...response.posts]);
        setPendingPage(nextPage);
        setPendingHasMore(response.currentPage < response.totalPages - 1);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      toast.error('Lỗi khi tải thêm bài viết');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleAddPost = async (content: string, imageUrls: string[]) => {
    if (!course?.id || !user) return;
    try {
      const newPostData = await createPost({
        content,
        imageUrls,
        courseId: course.id
      });
      if (course.requirePostApproval && user.role === 0) {
        setPendingPosts(prev => [newPostData, ...prev]);
      } else {
        setPosts(prev => [newPostData, ...prev]);
      }
      toast.success('Tạo bài viết thành công!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Lỗi khi tạo bài viết');
    }
  };

  const handleEditPost = async (postId: string, newContent: string, imageUrls: string[]) => {
    try {
      const updatedPostData = await updatePost(postId, { content: newContent, imageUrls: imageUrls });
      setPosts(prev => prev.map(p => p.id === postId ? updatedPostData : p));
      setPendingPosts(prev => prev.map(p => p.id === postId ? updatedPostData : p));

      toast.success('Cập nhật bài viết thành công!');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Lỗi khi cập nhật bài viết');
    }
  };

  const handleDeletePost = (postId: string) => {
    const post = posts.find(p => p.id === postId) || pendingPosts.find(p => p.id === postId);
    if (post) {
      setPostToDelete(post);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeletePostConfirm = async () => {
    if (postToDelete) {
      try {
        await deletePost(postToDelete.id);
        setPosts(prev => prev.filter(p => p.id !== postToDelete.id));
        setPendingPosts(prev => prev.filter(p => p.id !== postToDelete.id));
        toast.success('Xóa bài viết thành công!');
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Lỗi khi xóa bài viết');
      }
      setPostToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleApprovePost = async (postId: string, approved: boolean) => {
    try {
      await approvePost(postId, approved);

      const postToMove = pendingPosts.find(p => p.id === postId);
      setPendingPosts(prev => prev.filter(p => p.id !== postId));

      if (postToMove) {
        setPosts(prev => [postToMove, ...prev]);
        if (approved) {
          toast.success('Bài viết đã được duyệt!');
        } else {
          toast.warning('Bài viết đã bị từ chối!');
        }
      }
    } catch (error) {
      console.error('Error approving post:', error);
      toast.error('Lỗi khi phê duyệt bài viết');
    }
  };



  if (!user) {
    return <div className="text-center py-20 text-gray-600">Please log in to view this content.</div>;
  }

  const currentPosts = activeTab === 'community' ? posts : pendingPosts;
  const hasMore = activeTab === 'community' ? communityHasMore : pendingHasMore;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
          <div className="border-b border-[#d0dbe7] px-0 sm:px-0 flex">
            <button
              onClick={() => setActiveTab('community')}
              className={`flex flex-col items-center justify-center border-b-[3px] py-3 px-2 sm:px-4 flex-1 text-xs sm:text-sm font-bold tracking-[0.015em] transition-colors duration-150
                ${activeTab === 'community'
                  ? 'border-b-blue-600 text-blue-700'
                  : 'border-b-transparent text-gray-500 hover:text-gray-800 hover:border-b-gray-300'
                }`}
            >
              Bài đăng
            </button>
            {(
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex flex-col items-center justify-center border-b-[3px] py-3 px-2 sm:px-4 flex-1 text-xs sm:text-sm font-bold tracking-[0.015em] transition-colors duration-150
                  ${activeTab === 'pending'
                    ? 'border-b-blue-600 text-blue-700'
                    : 'border-b-transparent text-gray-500 hover:text-gray-800 hover:border-b-gray-300'
                  }`}
              >
                Chờ duyệt ({pendingPosts.length})
              </button>
            )}
          </div>
        </div>

        {(user.role === 1 || course?.allowStudentPost) && < NewPostForm
          currentUser={user}
          onSubmit={handleAddPost}
        />}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading posts...
          </div>
        ) : currentPosts.length > 0 ? (
          <>
            {currentPosts.map(post => (
              user && <PostItem
                key={post.id}
                post={post}
                currentUser={user}
                onEditPost={handleEditPost}
                onDeletePost={handleDeletePost}
                onApprovePost={activeTab === 'pending' ? handleApprovePost : undefined}
                isPending={activeTab === 'pending'}
              />
            ))}

            {hasMore && (
              <div className="text-center py-6">
                <button
                  onClick={loadMorePosts}
                  disabled={isLoadingMore}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoadingMore ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tải...
                    </>
                  ) : (
                    'Tải thêm bài viết'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white shadow-sm rounded-lg p-10">
            <img
              src={activeTab === 'community' ? EmptyPost : AllApprove}
              alt={activeTab === 'community' ? "No posts" : "No pending posts"}
              className="mx-auto h-24 w-24 mb-4 text-gray-300"
            />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              {activeTab === 'community' ? 'Chưa có bài viết nào ở đây...' : 'Tất cả đã được phê duyệt!'}
            </h3>
            <p className="text-sm">
              {activeTab === 'community' ? 'Hãy là người đầu tiên đăng bài viết đầu tiên!' : 'Hãy tạo bài viết mới!'}
            </p>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Xác nhận xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này không?"
        onConfirm={handleDeletePostConfirm}
        confirmButtonText="Xóa"
        confirmButtonColorClass="bg-red-600 hover:bg-red-700"
      />
      <ToastContainer />
    </div>
  );
};

export default CourseTopic;