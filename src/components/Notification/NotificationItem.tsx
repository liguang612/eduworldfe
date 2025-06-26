import React from 'react';
import { type NotificationData, markNotificationAsRead } from '@/api/notificationApi';
import DotFillIcon from '@/assets/dot_fill.svg';
import StudentAddedToCourseIcon from '@/assets/student_added_to_course.svg';
import JoinRequestAcceptedIcon from '@/assets/join_request_accepted.svg';
import JoinRequestRejectedIcon from '@/assets/join_request_rejected.svg';
import SolutionAcceptIcon from '@/assets/solution_accept.svg';
import SolutionRejectedIcon from '@/assets/solution_rejected.svg';
import PostApprovedIcon from '@/assets/post_approved.svg';
import PostRejectedIcon from '@/assets/post_rejected.svg';
import CommentOnOwnPostIcon from '@/assets/comment_on_own_post.svg';
import NewLectureInCourseIcon from '@/assets/new_lecture_in_course.svg';
import NewExamInCourseIcon from '@/assets/new_exam_in_course.svg';
import NewJoinRequestForTeacherIcon from '@/assets/new_join_request_for_teacher.svg';
import NewSolutionForTeacherApprovalIcon from '@/assets/new_solution_for_teacher_approval.svg';
import NewPostForTeacherApprovalIcon from '@/assets/new_post_for_teacher_approval.svg';
import { useNavigate } from 'react-router-dom';

interface NotificationItemProps {
  data: NotificationData;
  onClick?: (notificationId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ data, onClick }) => {
  const navigate = useNavigate();

  const handleItemClick = async () => {
    onClick?.(data.id);

    try {
      if (!data.read) {
        markNotificationAsRead(data.id);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }

    if (data.type === 'STUDENT_ADDED_TO_COURSE') {
      navigate(`/courses/${data.courseId}`);
    }
    if (data.type === 'JOIN_REQUEST_ACCEPTED') {
      navigate(`/courses/${data.courseId}`);
    }
    if (data.type === 'JOIN_REQUEST_REJECTED') {
      navigate(`/courses`);
    }
    if (data.type === 'SOLUTION_ACCEPTED') {
      navigate(`/question-bank/${data.questionId}/solutions`);
    }
    if (data.type === 'SOLUTION_REJECTED') {
      navigate(`/question-bank/${data.questionId}/solutions`);
    }
    if (data.type === 'POST_APPROVED') {
      navigate(`/courses/${data.courseId}/topics`);
    }
    if (data.type === 'POST_REJECTED') {
      navigate(`/courses/${data.courseId}/topics`);
    }
    if (data.type === 'COMMENT_ON_OWN_POST') {
      navigate(`/courses/${data.courseId}/topics`);
    }
    if (data.type === 'NEW_LECTURE_IN_COURSE') {
      navigate(`/courses/${data.courseId}/lectures`);
    }
    if (data.type === 'NEW_EXAM_IN_COURSE') {
      navigate(`/courses/${data.courseId}/exams`);
    }
    if (data.type === 'NEW_JOIN_REQUEST_FOR_TEACHER') {
      navigate(`/courses/${data.courseId}/edit`);
    }
    if (data.type === 'NEW_SOLUTION_FOR_TEACHER_APPROVAL') {
      navigate(`/question-bank/${data.questionId}/solutions`);
    }
    if (data.type === 'NEW_POST_FOR_TEACHER_APPROVAL') {
      navigate(`/courses/${data.courseId}/topics`);
    }

    console.log(data);
  };

  const getIconComponent = (data: NotificationData) => {
    if (data.courseAvatarUrl) {
      return <img src={data.courseAvatarUrl} alt="Notification Icon" className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-10" />;
    }
    if (data.actorAvatarUrl) {
      return <img src={data.actorAvatarUrl} alt="Notification Icon" className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-10" />;
    }

    if (data.type === 'STUDENT_ADDED_TO_COURSE') {
      return <img src={StudentAddedToCourseIcon} alt="Notification Icon" className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-10" />;
    }
    if (data.type === 'JOIN_REQUEST_ACCEPTED') {
      return <img src={JoinRequestAcceptedIcon} alt="Notification Icon" className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-10" />;
    }
    if (data.type === 'JOIN_REQUEST_REJECTED') {
      return <img src={JoinRequestRejectedIcon} alt="Notification Icon" className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-10" />;
    }
    if (data.type === 'SOLUTION_ACCEPTED') {
      return <img src={SolutionAcceptIcon} alt="Notification Icon" className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-10" />;
    }
    if (data.type === 'SOLUTION_REJECTED') {
      return <img src={SolutionRejectedIcon} alt="Notification Icon" className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-10" />;
    }
    if (data.type === 'POST_APPROVED') {
      return <img src={PostApprovedIcon} alt="Notification Icon" className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-10" />;
    }
    if (data.type === 'POST_REJECTED') {
      return <img src={PostRejectedIcon} alt="Notification Icon" className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-10" />;
    }
    if (data.type === 'COMMENT_ON_OWN_POST') {
      return <img src={CommentOnOwnPostIcon} alt="Notification Icon" className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-10" />;
    }
    if (data.type === 'NEW_LECTURE_IN_COURSE') {
      return <img src={NewLectureInCourseIcon} alt="Notification Icon" className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-10" />;
    }
    if (data.type === 'NEW_EXAM_IN_COURSE') {
      return <img src={NewExamInCourseIcon} alt="Notification Icon" className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-10" />;
    }
    if (data.type === 'NEW_JOIN_REQUEST_FOR_TEACHER') {
      return <img src={NewJoinRequestForTeacherIcon} alt="Notification Icon" className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-10" />;
    }
    if (data.type === 'NEW_SOLUTION_FOR_TEACHER_APPROVAL') {
      return <img src={NewSolutionForTeacherApprovalIcon} alt="Notification Icon" className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-10" />;
    }
    if (data.type === 'NEW_POST_FOR_TEACHER_APPROVAL') {
      return <img src={NewPostForTeacherApprovalIcon} alt="Notification Icon" className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-10" />;
    }

    return null;
  };

  const formatTimeAgo = (isoDate: string) => {
    const date = new Date(isoDate);
    const diff = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60));
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const getMessage = (data: NotificationData) => {
    // Học sinh
    if (data.type === 'STUDENT_ADDED_TO_COURSE') {
      return <div>Bạn đã được thêm vào khoá học: {data.courseName}</div>;
    }
    if (data.type === 'JOIN_REQUEST_ACCEPTED') {
      return <div>Yêu cầu tham gia khoá học <b>{data.courseName}</b> đã được chấp nhận! </div>;
    }
    if (data.type === 'JOIN_REQUEST_REJECTED') {
      return <div>Yêu cầu tham gia khoá học <b>{data.courseName}</b> đã bị từ chối!</div>;
    }
    if (data.type === 'SOLUTION_ACCEPTED') {
      return <div>Lời giải của bạn cho câu hỏi <b>{data.questionTitle}</b> đã được chấp nhận!</div>;
    }
    if (data.type === 'SOLUTION_REJECTED') {
      return <div>Lời giải của bạn cho câu hỏi <b>{data.questionTitle}</b> đã bị từ chối!</div>;
    }
    if (data.type === 'POST_APPROVED') {
      return <div>Bài viết của bạn trong khoá học <b>{data.courseName}</b> đã được chấp nhận!</div>;
    }
    if (data.type === 'POST_REJECTED') {
      return <div>Bài viết của bạn trong khoá học <b>{data.courseName}</b> đã bị từ chối!</div>;
    }
    if (data.type === 'COMMENT_ON_OWN_POST') {
      return <div><b>{data.actorName}</b> đã bình luận vào bài viết <b>{data.postTitle}</b> của bạn!</div>;
    }
    if (data.type === 'NEW_LECTURE_IN_COURSE') {
      return <div>Bài giảng <b>{data.lectureTitle}</b> đã được thêm vào khoá học <b>{data.courseName}</b>.</div>;
    }
    if (data.type === 'NEW_EXAM_IN_COURSE') {
      return <div>Đề thi <b>{data.examTitle}</b> đã được thêm vào khoá học <b>{data.courseName}</b>.</div>;
    }

    // Giáo viên
    if (data.type === 'NEW_JOIN_REQUEST_FOR_TEACHER') {
      return <div>{data.actorName} muốn tham gia khoá học <b>{data.courseName}</b> của bạn!</div>;
    }
    if (data.type === 'NEW_SOLUTION_FOR_TEACHER_APPROVAL') {
      return <div>{data.actorName} đã đóng góp 1 cách giải mới cho <b>{data.questionTitle}</b>!</div>;
    }
    if (data.type === 'NEW_POST_FOR_TEACHER_APPROVAL') {
      return <div>Có 1 bài đăng mới của <b>{data.actorName}</b> trong <b>{data.courseName}</b> đang chờ bạn phê duyệt.</div>;
    }

    return data.message;
  };

  const getTitle = (data: NotificationData) => {
    // Học sinh
    if (data.type === 'STUDENT_ADDED_TO_COURSE') {
      return `Lớp học`;
    }
    if (data.type === 'JOIN_REQUEST_ACCEPTED') {
      return `Lớp học`;
    }
    if (data.type === 'JOIN_REQUEST_REJECTED') {
      return `Lớp học`;
    }
    if (data.type === 'SOLUTION_ACCEPTED') {
      return `Lời giải`;
    }
    if (data.type === 'SOLUTION_REJECTED') {
      return `Lời giải`;
    }
    if (data.type === 'POST_APPROVED') {
      return `Thảo luận`;
    }
    if (data.type === 'POST_REJECTED') {
      return `Thảo luận`;
    }
    if (data.type === 'COMMENT_ON_OWN_POST') {
      return `Thảo luận`;
    }
    if (data.type === 'NEW_LECTURE_IN_COURSE') {
      return `Bài giảng`;
    }
    if (data.type === 'NEW_EXAM_IN_COURSE') {
      return `Đề thi`;
    }

    // Giáo viên
    if (data.type === 'NEW_JOIN_REQUEST_FOR_TEACHER') {
      return `Yêu cầu tham gia lớp học`;
    }
    if (data.type === 'NEW_SOLUTION_FOR_TEACHER_APPROVAL') {
      return `Đóng góp lời giải`;
    }
    if (data.type === 'NEW_POST_FOR_TEACHER_APPROVAL') {
      return `Thảo luận`;
    }

    return data.actorName;
  };

  return (
    <div
      className={`flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between hover:bg-slate-100 cursor-pointer border-b border-slate-200 last:border-b-0 ${!data.read ? 'bg-slate-50' : 'bg-white'}`}
      onClick={handleItemClick}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {getIconComponent(data)}
        <div className="flex flex-col flex-1 justify-center min-w-0">
          <p className={`text-[#0e141b] text-sm font-medium leading-normal line-clamp-1 ${!data.read ? 'font-bold' : 'font-medium'}`}>{getTitle(data)}</p>
          <div className="text-[#4e7297] text-xs font-normal leading-normal text-wrap line-clamp-2">
            {getMessage(data)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <p className="text-[#4e7297] text-xs font-normal leading-normal">{formatTimeAgo(data.createdAt)}</p>
        {!data.read && (
          <img
            src={DotFillIcon}
            alt={"Unread"}
            className="w-2.5 h-2.5"
          />
        )}
      </div>
    </div>
  );
};

export default NotificationItem;