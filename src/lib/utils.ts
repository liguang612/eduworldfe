import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

export function isJsonString(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function checkAnswerCorrectness(
  userAnswer: any,
  correctAnswer: any,
  questionType: string
): boolean {
  if (userAnswer === undefined || userAnswer === null || userAnswer === "" || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
    return false;
  }

  if (correctAnswer === undefined || correctAnswer === null) {
    return false;
  }

  if (isJsonString(userAnswer)) {
    userAnswer = JSON.parse(userAnswer);
  }
  if (isJsonString(correctAnswer)) {
    correctAnswer = JSON.parse(correctAnswer);
  }

  switch (questionType) {
    case 'radio':
    case 'shortAnswer':
      return String(userAnswer) === String(correctAnswer);

    case 'checkbox':
      const userArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      const correctArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
      return userArray.length === correctArray.length &&
        userArray.every(item => correctArray.includes(item));

    case 'ranking':
      const userRanking = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      const correctRanking = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
      return userRanking.length === correctRanking.length &&
        userRanking.every((item, index) => item === correctRanking[index]);

    case 'itemConnector':
      const userConnections = Array.isArray(userAnswer) ? userAnswer : (userAnswer ? [userAnswer] : []);
      const correctConnections = Array.isArray(correctAnswer) ? correctAnswer : (correctAnswer ? [correctAnswer] : []);

      if (userConnections.length !== correctConnections.length) {
        return false;
      } else {
        return userConnections.every(userConn => {
          return correctConnections.some(correctConn =>
            String(userConn.from) === String(correctConn.from) && String(userConn.to) === String(correctConn.to)
          );
        });
      }

    default:
      return String(userAnswer) === String(correctAnswer);
  }
}

export function translateMessage(message: string) {
  switch (message) {
    case 'An unexpected error occurred: Not authorized to update this post':
      return 'Bạn không có quyền chỉnh sửa bài viết này';
    case 'An unexpected error occurred: Not authorized to delete this post':
      return 'Bạn không có quyền xóa bài viết này';
    case 'An unexpected error occurred: Not authorized to approve this post':
      return 'Bạn không có quyền phê duyệt bài viết này';
    case 'An unexpected error occurred: Not authorized to delete this comment':
      return 'Bạn không có quyền xóa bình luận này';
    case 'An unexpected error occurred: Not authorized to edit this comment':
      return 'Bạn không có quyền chỉnh sửa bình luận này';
    default:
      return message;
  }
}