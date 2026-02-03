export type Solution = {
  slug: string
  name: string
  desc: string
}

export type Journey = {
  key: string
  title: string
  subtitle: string
  steps: string[]
}

export const solutions: Solution[] = [
  { slug: 'camera-ai', name: 'Camera AI', desc: 'Giám sát thông minh, phát hiện & cảnh báo theo thời gian thực.' },
  { slug: 'vehicle-control', name: 'Kiểm soát phương tiện', desc: 'ANPR/nhận diện, điều phối bãi đỗ, kiểm soát vào/ra.' },
  { slug: 'people-access', name: 'Kiểm soát con người', desc: 'Đa phương thức định danh, e-gate, phân quyền & phân tầng.' },
  { slug: 'baggage-security', name: 'Kiểm soát hành lý/đồ vật', desc: 'X-ray + AI phát hiện đồ cấm, tủ gửi đồ thông minh.' },
  { slug: 'elevator', name: 'Điều khiển thang máy', desc: 'Điều phối theo quyền truy cập, tối ưu hành trình, giám sát an toàn.' },
  { slug: 'noc', name: 'NOC tòa nhà', desc: 'Trung tâm vận hành, theo dõi đa hệ thống, xử lý sự cố tập trung.' },
  { slug: 'smart-office', name: 'Phòng làm việc thông minh', desc: 'Khóa sinh trắc, intercom, cảm biến, điều khiển giọng nói.' },
  { slug: 'robot', name: 'Robot dịch vụ', desc: 'Đặt dịch vụ, giao hàng, kết nối thang máy/cửa, theo dõi trạng thái.' },
  { slug: 'management-platform', name: 'Nền tảng quản lý tập trung', desc: 'Dashboard hợp nhất, quản trị thiết bị, cảnh báo, báo cáo.' },
  { slug: 'smart-electric', name: 'Điện thông minh (Phase 2)', desc: 'Đo lường, giám sát & tối ưu tiêu thụ điện.' },
  { slug: 'ems', name: 'EMS (Phase 2)', desc: 'Energy Management System, tối ưu năng lượng theo kịch bản.' },
  { slug: 'smart-fire', name: 'Báo cháy thông minh (Phase 2)', desc: 'Giám sát cảnh báo sớm, tích hợp vận hành & nhật ký.' },
]

export const journeys: Journey[] = [
  {
    key: 'vip',
    title: 'VIP',
    subtitle: 'Trải nghiệm đón tiếp ưu tiên, nhanh và an toàn.',
    steps: [
      'Nhận diện phương tiện (biển số) → mở barrier',
      'Chào mừng/điều phối bãi đỗ',
      'E-gate/định danh nhanh',
      'Điều phối thang máy đến tầng mục tiêu',
      'Theo dõi hành trình & cảnh báo theo ngữ cảnh',
    ],
  },
  {
    key: 'staff',
    title: 'Nhân viên',
    subtitle: 'Ra/vào thuận tiện, đồng bộ chấm công & phân quyền.',
    steps: [
      'Đăng ký định danh (khuôn mặt/thẻ/QR)',
      'Kiểm soát phương tiện + phân quyền bãi đỗ',
      'Vào tòa nhà qua e-gate',
      'Phân tầng thang máy theo vai trò',
      'Báo cáo vận hành & lịch sử truy cập',
    ],
  },
  {
    key: 'visitor',
    title: 'Visitor',
    subtitle: 'Quy trình đăng ký – kiểm tra – hướng dẫn rõ ràng.',
    steps: [
      'Đăng ký trước/đăng ký tại chỗ (QR)',
      'Kiểm soát phương tiện tại cổng',
      'Kiểm tra hành lý/đồ vật (X-ray + AI)',
      'Tủ gửi đồ thông minh (nếu cần)',
      'E-gate + điều phối thang máy đến khu vực cho phép',
    ],
  },
]
