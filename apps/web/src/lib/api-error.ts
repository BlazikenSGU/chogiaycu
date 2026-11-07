
import axios from 'axios';

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;

    if (Array.isArray(data?.message)) {
      return data.message.join(', ');
    }

    if (typeof data?.message === 'string') {
      return data.message;
    }

    if (!error.response) {
      return 'Không thể kết nối đến máy chủ.';
    }

    switch (error.response.status) {
      case 401:
        return 'Phiên đăng nhập không hợp lệ.';

      case 403:
        return 'Bạn không có quyền thực hiện thao tác.';

      case 404:
        return 'Không tìm thấy dữ liệu.';

      case 500:
        return 'Máy chủ đang gặp sự cố.';

      default:
        return `Yêu cầu thất bại (${error.response.status}).`;
    }
  }

  return 'Đã xảy ra lỗi không xác định.';
}
