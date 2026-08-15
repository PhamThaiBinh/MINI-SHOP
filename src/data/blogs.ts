export interface BlogArticle {
  id: number;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  img: string;
  author: string;
  readTime: string;
  content: string;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 1,
    title: "5 Cách Phối Màu Sofa Nordic Cho Phòng Khách Tối Giản",
    category: "Mẹo Nội Thất",
    date: "10/08/2026",
    excerpt: "Tìm hiểu bí quyết kết hợp gam màu xám ghi, kem đất và xanh Navy với khung gỗ tự nhiên tạo nên không gian Bắc Âu tinh tế.",
    img: "assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp",
    author: "Biên tập viên Mini Shop",
    readTime: "5 phút đọc",
    content: `
      <p>Phong cách Nordic (Bắc Âu) từ lâu đã trở thành nguồn cảm hứng bất tận trong thiết kế nội thất nhờ sự hòa quyện giữa vẻ đẹp tối giản, công năng tiện nghi và cảm giác ấm cúng tràn ngập căn phòng.</p>
      
      <h2>1. Tận Dụng Gam Màu Xám Ghi Làm Nền Tảng</h2>
      <p>Màu xám ghi là tông màu trung tính hoàn hảo để tạo nên sự tĩnh lặng và thanh lịch. Khi đặt chiếc Sofa nỉ xám ghi vào giữa phòng khách, bạn dễ dàng phối hợp thêm gối ôm hoặc thảm trải sàn màu kem mà không lo rối mắt.</p>

      <div class="article-quote">
        "Sự tối giản trong phong cách Bắc Âu không đồng nghĩa với đơn điệu, mà là nghệ thuật chắt lọc những gì tinh túy và tự nhiên nhất."
      </div>

      <h2>2. Kết Hợp Khung Gỗ Tự Nhiên & Ánh Sáng Vàng Warm</h2>
      <p>Để căn phòng không bị lạnh lẽo, chất liệu gỗ sồi hoặc gỗ tần bì với sắc vàng mộc mạc của chân sofa sẽ tạo nên sự cân bằng hoàn hảo. Kết hợp cùng ánh sáng vàng ấm từ chiếc đèn thả trần đan tre thủ công sẽ mang lại không gian thư giãn lý tưởng cho cả gia đình.</p>

      <h2>3. Điểm Xuyết Mảng Xanh Tự Nhiên</h2>
      <p>Đừng quên bổ sung một chậu cây xanh nhỏ nhắn ngay cạnh góc sofa. Sắc xanh mướt mát không chỉ lọc không khí mà còn giúp tổng thể phòng khách trở nên sinh động và tràn đầy sức sống.</p>
    `
  },
  {
    id: 2,
    title: "Bảo Quản Đồ Tre Đan & Sơn Mài Không Lo Mối Mọt",
    category: "Đồ Mỹ Nghệ",
    date: "08/08/2026",
    excerpt: "Những thói quen đơn giản giúp duy trì độ bóng của khay sơn mài khảm xà cừ và tuổi thọ cho các loại đèn lồng tre thủ công.",
    img: "assets/images/products/do-my-nghe/den-tre-thu-cong.webp",
    author: "Biên tập viên Mini Shop",
    readTime: "4 phút đọc",
    content: `
      <p>Đồ thủ công mây tre đan và sơn mài khảm xà cừ mang nét đẹp truyền thống mộc mạc nhưng đòi hỏi quy trình bảo quản đúng cách để không bị ẩm mốc hay mối mọt qua thời gian.</p>
      
      <h2>1. Tránh Ánh Nắng Trực Tiếp & Nơi Nắng Gắt</h2>
      <p>Sợi tre và men sơn mài nhạy cảm với nhiệt độ quá cao. Hãy đặt đèn lồng tre hoặc khay sơn mài ở nơi thoáng mát, tránh tiếp xúc trực tiếp với ánh nắng mặt trời chiếu gắt trong thời gian dài.</p>

      <h2>2. Vệ Sinh Bằng Khăn Mềm Vắt Khô</h2>
      <p>Khi lau chùi khay khảm xà cừ hay hộp sơn mài, chỉ nên dùng khăn bông mềm hơi ẩm lau nhẹ nhàng bề mặt, tuyệt đối không dùng chất tẩy rửa mạnh hay bùi nhùi kim loại gây trầy xước lớp bóng.</p>
    `
  },
  {
    id: 3,
    title: "Tại Sao Nên Chọn Bàn Ăn Gỗ Sồi Tự Nhiên Cho Căn Bếp?",
    category: "Gia Dụng",
    date: "05/08/2026",
    excerpt: "Đánh giá độ bền, khả năng chống trầy xước và tính thẩm mỹ ấm cúng của chất liệu gỗ sồi Mỹ nhập khẩu trong sinh hoạt gia đình.",
    img: "assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp",
    author: "Biên tập viên Mini Shop",
    readTime: "6 phút đọc",
    content: `
      <p>Bàn ăn không chỉ là nơi sum họp bữa cơm gia đình mà còn là tâm điểm thẩm mỹ của căn bếp. Gỗ sồi (Oak) tự nhiên luôn là sự lựa chọn ưu tiên hàng đầu nhờ các ưu điểm vượt trội.</p>
      
      <h2>1. Độ Bền Cao & Khả Năng Chống Va Đập Vượt Trội</h2>
      <p>Gỗ sồi Mỹ có kết cấu tế bào chặt chẽ, khả năng chịu lực nén tốt và bền bỉ qua hàng chục năm sử dụng. Bề mặt phủ sơn PU chống thấm nước giúp bạn dễ dàng lau sạch vết dầu mỡ sau mỗi bữa ăn.</p>

      <h2>2. Vân Gỗ Tự Nhiên Ấm Cúng</h2>
      <p>Từng đường vân gỗ sồi cuộn sóng tự nhiên mang lại cảm giác thân thiện, gắn kết các thành viên trong gia đình trong từng khoảnh khắc sinh hoạt.</p>
    `
  }
];
