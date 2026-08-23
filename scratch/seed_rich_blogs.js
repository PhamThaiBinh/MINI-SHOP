const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://gqfsvwtytqjlyiogytgk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxZnN2d3R5dHFqbHlpb2d5dGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNTA5MDQsImV4cCI6MjA4NjkyNjkwNH0.0GfFpW4o4f6D12y_r7_yVnSg8F0Uj18m3yE4a2o8T7g";
const supabase = createClient(supabaseUrl, supabaseKey);

const BLOGS_DATA = [
  {
    id: 1,
    blog_id: "B0001",
    title: "5 Cách Phối Màu Sofa Nordic Cho Phòng Khách Tối Giản",
    category: "Phòng khách",
    date: "18/08/2026",
    excerpt: "Tìm hiểu bí quyết kết hợp gam màu xám ghi, kem đất và xanh Navy với khung gỗ tự nhiên tạo nên không gian Bắc Âu tinh tế, ấm cúng và tràn ngập tính nghệ thuật.",
    img: "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp",
    author: "KTS. Lê Hoàng Nam",
    read_time: "12 phút đọc",
    content: `
      <p>Phong cách Nordic (Bắc Âu) từ lâu đã trở thành nguồn cảm hứng bất tận trong thiết kế nội thất nhờ sự hòa quyện giữa vẻ đẹp tối giản, công năng tiện nghi và cảm giác ấm cúng tràn ngập căn phòng. Điểm trung tâm tạo nên tinh thần của toàn bộ phòng khách chính là chiếc ghế Sofa. Lựa chọn sắc màu sofa chuẩn xác không chỉ tôn vinh giá trị thẩm mỹ của ngôi nhà mà còn thể hiện gu sống tinh tế của gia chủ.</p>
      
      <p>Trong kiến trúc hiện đại, phối màu sofa không chỉ đơn thuần là chọn một màu sắc đẹp mắt mà là bài toán cân bằng ánh sáng, tỷ lệ diện tích và cảm xúc của các thành viên trong gia đình. Dưới đây là 5 phương pháp phối màu sofa chuẩn Scandinavian đắt giá nhất do các kiến trúc sư hàng đầu khuyên dùng.</p>

      <h2>1. Tận Dụng Gam Màu Xám Ghi Làm Nền Tảng Tĩnh Lặng</h2>
      <p>Màu xám ghi là tông màu trung tính hoàn hảo để tạo nên sự tĩnh lặng và thanh lịch cho căn phòng. Khi đặt chiếc Sofa nỉ xám ghi vào giữa không gian, bạn có thể dễ dàng phối hợp thêm gối ôm sắc kem đất hoặc thảm trải sàn dệt sợi tự nhiên mà không bao giờ lo bị rối mắt.</p>
      <p>Gam màu xám ghi còn có ưu điểm vượt trội trong việc điều hòa ánh sáng. Vào những ngày trời râm mát hoặc thiếu nắng, sắc xám mờ nhẹ kết hợp cùng ánh sáng đèn dải vàng warm 3000K sẽ tỏa ra hiệu ứng thị giác vô cùng êm dịu, giúp tinh thần giảm bớt căng thẳng sau những giờ làm việc mệt mỏi tại chốn công sở.</p>
      <p>Hơn thế nữa, sắc xám ghi có khả năng giấu vết bẩn vô cùng tuyệt vời. Đối với các gia đình có trẻ nhỏ hoặc nuôi thú cưng, sofa vải nỉ xám ghi là sự đầu tư dài hạn giúp duy trì độ sạch sẽ và vẻ đẹp hoàn hảo qua nhiều năm sử dụng mà không cần tốn quá nhiều chi phí giặt hấp chuyên sâu hằng tháng.</p>

      <div class="article-quote">
        "Sự tối giản trong phong cách Bắc Âu không đồng nghĩa với đơn điệu, mà là nghệ thuật chắt lọc những gì tinh túy, hài hòa và gần gũi với thiên nhiên nhất."
      </div>

      <h2>2. Kết Hợp Khung Gỗ Tự Nhiên & Ánh Sáng Vàng Warm</h2>
      <p>Để căn phòng không bị cảm giác quá lạnh lẽo hay nhạt nhòa, chất liệu gỗ sồi hoặc gỗ tần bì tự nhiên với sắc vàng mộc mạc của chân sofa sẽ tạo nên sự cân bằng hoàn hảo. Gỗ tự nhiên mang năng lượng ấm áp của thiên nhiên vào thẳng trung tâm ngôi nhà.</p>
      <p>Hãy kết hợp chiếc sofa gỗ sồi này với ánh sáng vàng ấm tỏa ra từ chiếc đèn thả trần đan tre thủ công. Sự đan xen giữa bóng râm của các nan tre và sắc vàng ấm cúng sẽ tôn lên từng đường nét tinh tế của bề mặt vải bọc sofa, kiến tạo một góc thư giãn lý tưởng cho cả gia đình vào những buổi tối cuối tuần.</p>
      <p>Các nghiên cứu về tâm lý học không gian đã chỉ ra rằng, việc tiếp xúc hằng ngày với bề mặt gỗ sồi lau sáp mộc mạc giúp làm giảm nhịp tim và cân bằng chỉ số cortisol. Đây chính là lý do vì sao phong cách thiết kế Nordic luôn mang lại cảm giác bình yên sâu lắng cho bất kỳ ai bước chân vào căn phòng.</p>

      <h2>3. Điểm Xuyết Mảng Xanh Tự Nhiên Nổi Bật</h2>
      <p>Đừng quên bổ sung một chậu cây cảnh decor nhỏ nhắn ngay cạnh góc sofa như Cây Bàng Đài Loan, Cây Trầu Bà Thanh Xuân hoặc Cây Cọ Cảnh. Sắc xanh mướt mát không chỉ giúp thanh lọc không khí hiệu quả mà còn tạo điểm nhấn chấm phá sinh động trên nền không gian màu xám kem.</p>
      <p>Sự kết hợp giữa chất liệu vải bọc mờ, chân gỗ mộc mạc và sắc xanh tươi mới của cây cảnh là công thức phối màu chuẩn mực chuẩn phong cách Scandinavian hiện đại mà bất kỳ gia chủ nào cũng có thể áp dụng thành công cho căn hộ của mình.</p>
      <p>Bạn có thể đặt chậu cây trong các giỏ mây đan thủ công để tạo sự đồng điệu tối đa về mặt chất liệu. Sự hiện diện của mây tre đan cùng màu xanh lá cây sẽ xóa tan hoàn toàn vẻ thô cứng của các mảng tường bê tông phẳng.</p>

      <h2>4. Phối Sắc Kem Đất & Gối Trang Trí Pastel</h2>
      <p>Nếu bạn yêu thích sự dịu dàng và thanh thoát, tone màu kem đất (Creamy Beige) sẽ là lựa chọn tuyệt vời. Khi kết hợp sofa màu kem đất với bộ gối trang trí tông màu Pastel như xanh ngọc mờ, hồng đất nhạt hoặc vàng mù tạt, căn phòng khách sẽ ngay lập tức bừng sáng vẻ đẹp ngọt ngào và tinh tế.</p>
      <p>Để duy trì độ bền cho sofa màu kem, bạn nên lựa chọn dòng vải nỉ chống bám dính bẩn cao cấp, phủ lớp kháng nước tiêu chuẩn Châu Âu giúp việc lau chùi hằng ngày trở nên nhẹ nhàng và tiện lợi chỉ với một chiếc khăn bông ẩm.</p>

      <h2>5. Lời Khuyên Chuyên Gia & Hướng Dẫn Vệ Sinh Định Kỳ</h2>
      <p>Vệ sinh hằng ngày đóng vai trò quyết định đến tuổi thọ và vẻ đẹp của chiếc sofa. Bạn nên dùng máy hút bụi đầu chổi mềm để làm sạch bọ bụi 2 tuần/lần, kết hợp sử dụng dung dịch bọt bọc nỉ chuyên dụng để xử lý ngay các vết bẩn vô tình dính phải.</p>
      <p>Bên cạnh đó, tránh đặt sofa dưới ánh nắng mặt trời trực tiếp gay gắt qua cửa kính để giữ cho sắc màu vải bọc luôn duy trì được độ tươi mới và nguyên bản theo thời gian dài.</p>
    `
  },
  {
    id: 2,
    blog_id: "B0002",
    title: "Bảo Quản Đồ Tre Đan & Sơn Mài Không Lo Mối Mọt",
    category: "Trang trí",
    date: "15/08/2026",
    excerpt: "Những thói quen đơn giản giúp duy trì độ bóng của khay sơn mài khảm xà cừ và kéo dài tuổi thọ chống ẩm mốc cho các loại đèn lồng tre thủ công.",
    img: "/assets/images/products/do-my-nghe/den-tre-thu-cong.webp",
    author: "Nghệ nhân Nguyễn Văn Tâm",
    read_time: "11 phút đọc",
    content: `
      <p>Đồ thủ công mây tre đan và sơn mài khảm xà cừ mang nét đẹp truyền thống mộc mạc nhưng đòi hỏi quy trình bảo quản đúng kỹ thuật để không bị ẩm mốc hay mối mọt qua thời gian khí hậu ẩm ướt tại Việt Nam.</p>
      <p>Mây tre và sơn mài là các chất liệu hữu cơ tự nhiên có đặc tính hút ẩm cao. Nếu không biết cách vệ sinh và lưu trữ đúng cách, bề mặt vật dụng rất dễ bị nấm mốc trắng tấn công hoặc xuất hiện các nếp nứt chim làm mất đi giá trị thẩm mỹ vốn có.</p>

      <h2>1. Tránh Ánh Nắng Trực Tiếp & Nơi Độ Ẩm Cao</h2>
      <p>Sợi tre tự nhiên và men sơn mài truyền thống rất nhạy cảm với sự thay đổi đột ngột của nhiệt độ và độ ẩm. Hãy đặt các vật dụng đan tre như đèn lồng, giỏ mây hoặc khay sơn mài ở những nơi khô ráo, thông thoáng gió, tránh tiếp xúc trực tiếp dưới ánh nắng chiếu nắng gắt trong thời gian dài.</p>
      <p>Vào những ngày thời tiết nồm ẩm cao điểm của miền Bắc, bạn nên bật máy hút ẩm hoặc đóng kín cửa kính phòng để duy trì độ ẩm không khí lý tưởng dưới 65%, ngăn chặn các vi khuẩn mốc nấm cơ hội phát triển trên thớ tre.</p>
      <p>Đặc biệt đối với các món đồ mây tre đan mộc mạc chưa qua xử lý sơn phủ bọt bóng, gia chủ cần hạn chế tối đa việc đặt sản phẩm trực tiếp dưới nền nhà gạch bông ẩm ướt. Sử dụng đôn gỗ nâng cao hoặc kệ chân sắt để tạo khoảng cách an toàn với mặt sàn.</p>

      <div class="article-quote">
        "Nghệ thuật bảo tồn đồ mỹ nghệ mây tre truyền thống nằm ở sự tỉ mỉ trong thói quen chăm sóc hằng ngày."
      </div>

      <h2>2. Quy Trình Vệ Sinh Bằng Khăn Mềm Vắt Khô Hàng Tuần</h2>
      <p>Khi lau chùi đồ mây tre và sơn mài khảm xà cừ, tuyệt đối không xả nước trực tiếp lên bề mặt. Chỉ nên dùng khăn bông cotton mềm ẩm nhẹ nhàng lau từng kẽ đan tre để làm sạch bụi bẩn tích tụ.</p>
      <p>Sau khi lau khăn ẩm, bạn phải dùng ngay một chiếc khăn khô mịn khác để thấm sạch hoàn toàn những giọt nước đọng trong các khe nan tre. Việc này ngăn chặn tuyệt đối nước ngấm vào lõi tre gây mủn gãy sợi đan.</p>

      <h2>3. Xử Lý Chống Mối Mọt Bằng Phương Pháp Tự Nhiên Safe-Tech</h2>
      <p>Bạn có thể sử dụng tinh dầu sả chanh hoặc tinh dầu quế tự nhiên lau nhẹ lên bề mặt nan tre sau khi vệ sinh sạch sẽ. Mùi hương tự nhiên của tinh dầu vừa tạo cảm giác thư thái dễ chịu cho ngôi nhà, vừa là rào cản tự nhiên xua đuổi các loài côn trùng và mối mọt gây hại.</p>
      <p>Ngoài ra, muối hột ngâm nước ấm cũng là bài thuốc dân gian diệt khuẩn mây tre vô cùng hiệu quả. Dùng bàn chải đánh răng lông mềm thấm nhẹ dung dịch nước muối loãng chà nhẹ lên vết mốc mới xuất hiện, sau đó mang ra phơi ở nơi có gió nhẹ thoáng mát.</p>

      <h2>4. Đánh Bóng Lớp Men Sơn Mài Định Kỳ Bằng Sáp Chuyên Dụng</h2>
      <p>Đối với khay trà sơn mài hoặc hộp trang trí khảm xà cừ, bạn có thể áp dụng sáp dưỡng bề mặt chuyên dụng 6 tháng một lần để giữ cho lớp men bóng luôn đạt độ trong trẻo và lấp lánh như lúc mới mua.</p>
      <p>Quy trình thực hiện: Dùng miếng mút trang điểm chấm một lượng nhỏ sáp ong tự nhiên, xoa tròn đều khắp mặt khay sơn mài, để yên 15 phút cho sáp thẩm thấu rồi dùng khăn lau kính đánh bóng lại đến khi bề mặt đạt độ sáng chiếu gương hoàn hảo.</p>
    `
  },
  {
    id: 3,
    blog_id: "B0003",
    title: "Tại Sao Nên Chọn Bàn Ăn Gỗ Sồi Tự Nhiên Cho Căn Bếp?",
    category: "Nhà bếp",
    date: "12/08/2026",
    excerpt: "Đánh giá chi tiết độ bền vượt trội, khả năng chống va đập, vân gỗ sồi mộc mạc và giá trị thẩm mỹ ấm cúng của bộ bàn ăn gỗ sồi Mỹ nhập khẩu trong sinh hoạt gia đình.",
    img: "/assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp",
    author: "KTS. Trần Hoàng Anh",
    read_time: "10 phút đọc",
    content: `
      <p>Bàn ăn không chỉ đơn thuần là nơi thưởng thức bữa ăn hằng ngày mà còn là trái tim kết nối tình cảm gia đình, nơi lưu giữ những khoảnh khắc sum họp ấm áp sau một ngày làm việc bận rộn. Lựa chọn bàn ăn gỗ sồi tự nhiên luôn là quyết định sáng suốt hàng đầu của các gia chủ hiện đại.</p>
      <p>Gỗ sồi (Oak) tự nhiên nhập khẩu từ Bắc Mỹ nổi tiếng thế giới nhờ cấu trúc sớ gỗ bền chắc, vân gỗ cuộn sóng sang trọng cùng tone màu mộc mạc thân thiện. Hãy cùng phân tích 5 lý do vì sao bộ bàn ăn gỗ sồi luôn giữ vững vị trí số 1 trong lòng khách hàng nội thất.</p>

      <h2>1. Độ Bền Cao & Khả Năng Chống Va Đập Vượt Trội</h2>
      <p>Gỗ sồi Mỹ có kết cấu tế bào chặt chẽ, khả năng chịu lực nén tốt và bền bỉ qua hàng chục năm sử dụng. Bề mặt phủ sơn PU chống thấm nước giúp bạn dễ dàng lau sạch vết dầu mỡ hay nước súp rớt ra sau mỗi bữa ăn gia đình.</p>
      <p>Hơn nữa, gỗ sồi đã qua quy trình sấy lò vi sóng tiêu chuẩn quốc tế giúp triệt tiêu hoàn toàn nguy cơ cong vênh, co ngót hay nứt nẻ dưới sự thay đổi thời tiết thất thường. Bạn hoàn toàn có thể yên tâm sử dụng bàn ăn gỗ sồi qua nhiều thế hệ mà chất lượng vẫn duy trì nguyên vẹn.</p>

      <div class="article-quote">
        "Bàn ăn gỗ sồi là khoản đầu tư dài hạn mang lại giá trị sử dụng bền vững và cảm giác ấm cúng trọn vẹn cho ngôi nhà."
      </div>

      <h2>2. Vân Gỗ Sồi Tự Nhiên Sang Trọng & Thân Thiện</h2>
      <p>Từng đường vân gỗ sồi cuộn sóng tự nhiên mang lại cảm giác thân thiện, gắn kết các thành viên trong gia đình trong từng khoảnh khắc sinh hoạt. Không có hai chiếc bàn ăn gỗ sồi nào sở hữu vân gỗ hoàn toàn giống nhau, tạo nên tính duy nhất và đẳng cấp cá nhân cho gia chủ.</p>
      <p>Sắc vàng sồi tự nhiên dễ dàng phối hợp ăn ý với mọi phong cách thiết kế từ Modern Nordic tối giản cho đến Indochine hoài cổ, giúp căn bếp luôn bừng sáng không khí ấm áp tràn đầy năng lượng tích cực.</p>

      <h2>3. An Toàn Cho Sức Khỏe Gia Đình & Trẻ Nhỏ</h2>
      <p>Các sản phẩm bàn ăn gỗ sồi tại MINI-SHOP được phủ sơn lau sáp gốc thực vật không chứa chì hay chất bọt độc hại formaldehyde, đạt chứng nhận an toàn sức khỏe tuyệt đối khi tiếp xúc trực tiếp với thức ăn.</p>
      <p>Các cạnh viền mặt bàn đều được thợ thủ công bo tròn tinh tế (R-edge radius), loại bỏ hoàn toàn các góc nhọn sắc chấn thương khi nhà có trẻ nhỏ hiếu động vui chơi quanh khu vực bàn ăn.</p>

      <h2>4. Hướng Dẫn Vệ Sinh & Bảo Quản Bàn Ăn Luôn Sáng Mới</h2>
      <p>Để giữ cho mặt bàn ăn gỗ sồi luôn mịn màng bóng bẩy, bạn nên sử dụng đế lót ly cách nhiệt khi đặt nồi canh nóng hay cốc nước đá. Vệ sinh hằng ngày bằng khăn ẩm mềm thấm dung dịch nước rửa chén loãng, sau đó lau lại bằng khăn khô.</p>
    `
  },
  {
    id: 4,
    blog_id: "B0004",
    title: "Xu Hướng Đèn Decor Mây Tre Cho Không Gian Hiện Đại",
    category: "Đèn chiếu sáng",
    date: "10/08/2026",
    excerpt: "Khám phá nghệ thuật kết hợp ánh sáng vàng ấm từ các mẫu đèn lồng tre thủ công mộc mạc tạo điểm nhấn tinh tế sang trọng cho phòng ăn và phòng khách.",
    img: "/assets/images/products/do-my-nghe/den-long-tre.webp",
    author: "Biên tập viên Mini Shop",
    read_time: "9 phút đọc",
    content: `
      <p>Ánh sáng được ví như linh hồn thổi sức sống vào mọi không gian kiến trúc. Việc kết hợp các mẫu đèn lồng tre đan thủ công mộc mạc vào không gian nội thất hiện đại đang là xu hướng bùng nổ năm 2026.</p>
      <p>Những chiếc đèn tre thủ công được các nghệ nhân chẻ nan tỉ mỉ, đan uốn hình dáng búp sen, quả cầu hay chiếc nơm cá truyền thống. Khi thắp sáng, ánh đèn len lỏi qua từng khe nan tre tạo nên vũ điệu bóng râm đầy tính nghệ thuật trên mảng tường phòng ăn.</p>

      <h2>1. Chọn Kích Thước Đèn Tre Phù Hợp Bàn Ăn</h2>
      <p>Chiếc đèn thả tre nên treo cách mặt bàn ăn khoảng 70cm - 80cm để ánh sáng tỏa đều mà không gây chói mắt người ngồi. Đối với bàn ăn dài 1.6m, bạn nên treo bộ 2 hoặc 3 chiếc đèn tre thả hình búp sen xếp nối tiếp để tạo sự cân đối thị giác hoàn hảo.</p>

      <div class="article-quote">
        "Đèn mây tre đan không chỉ chiếu sáng mà còn là tác phẩm điêu khắc nghệ thuật kết nối con người với cội nguồn thiên nhiên."
      </div>

      <h2>2. Phối Đèn Tre Với Không Gian Đồ Gỗ Sồi</h2>
      <p>Sự kết hợp giữa chất liệu gỗ sồi vàng ấm và nét mộc mạc của nan tre tạo nên tổng thể không gian mộc mạc nhưng vô cùng tinh tế. Khách ghé thăm nhà sẽ ngay lập tức bị thu hút bởi cảm giác thư thái dễ chịu tỏa ra từ không gian ấm cúng này.</p>

      <h2>3. Lựa Chọn Bóng Đèn LED Tiết Kiệm Năng Lượng & Ánh Sáng Warm</h2>
      <p>Đối với đèn mây tre đan, nhiệt độ màu lý tưởng nhất là từ 2700K đến 3000K (ánh sáng vàng ấm). Không nên dùng bóng đèn dây tóc tỏa nhiệt cao dễ làm khô giòn nan tre, thay vào đó hãy chọn bóng LED sợi đốt giả cổ bắp ngô tiết kiệm điện và bền bỉ.</p>
    `
  },
  {
    id: 5,
    blog_id: "B0005",
    title: "Giải Pháp Thiết Kế Căn Hộ Nhỏ 35m2 Tối Ưu Không Gian",
    category: "Lưu trữ",
    date: "08/08/2026",
    excerpt: "Khám phá nghệ thuật bài trí nội thất đa năng, sử dụng vách ngăn thoáng mây tre và gam màu sáng giúp hô biến căn hộ diện tích nhỏ trở nên rộng rãi gấp đôi.",
    img: "/assets/images/products/noi-that-gia-dung/ke-go-trang-tri.webp",
    author: "KTS. Trần Hoàng Anh",
    read_time: "11 phút đọc",
    content: `
      <p>Căn hộ diện tích khiêm tốn 35m² - 45m² đang là lựa chọn phổ biến của người trẻ thành thị. Làm thế nào để vừa đảm bảo đầy đủ tiện nghi sinh hoạt vừa tạo được cảm giác thông thoáng tự do? Bí quyết nằm ở lối tư duy thiết kế nội thất thông minh.</p>
      <p>Với diện tích hạn chế, việc nhồi nhét quá nhiều đồ đạc sẽ khiến ngôi nhà trở nên chật chội và ngột ngạt. Bằng cách áp dụng các giải pháp tối ưu không gian dưới đây, bạn hoàn toàn có thể biến căn hộ 35m² trở nên rộng rãi và tiện nghi bất ngờ.</p>

      <h2>1. Sử Dụng Nội Thất Đa Năng Thông Minh</h2>
      <p>Hãy ưu tiên các món đồ nội thất tích hợp 2-trong-1 như Bàn trà tích hợp ngăn kéo chứa đồ, Kệ gỗ mở kết hợp vách ngăn không gian, hoặc Sofa giường xếp gọn. Các món đồ này giúp giải phóng tối đa không gian sàn trống di chuyển.</p>
      <p>Ví dụ: Chiếc bàn ăn gấp gọn thông minh có thể mở rộng cho 6 người ăn khi có khách và thu gọn lại thành chiếc tủ trang trí mỏng 25cm khi không sử dụng.</p>

      <div class="article-quote">
        "Trong căn hộ nhỏ, mỗi centimet vuông đều là một tác phẩm nghệ thuật của sự sắp đặt tinh tế."
      </div>

      <h2>2. Tận Dụng Gam Màu Sáng & Gương Soi Nối Dài Thị Giác</h2>
      <p>Màu trắng kem, xám nhạt kết hợp cùng gương soi treo tường khổ lớn sẽ phản chiếu ánh sáng tự nhiên từ cửa sổ, giúp thị giác nhân đôi chiều sâu không gian căn phòng một cách thần kỳ.</p>

      <h2>3. Sử Dụng Vách Ngăn Mây Tre Thoáng Gió</h2>
      <p>Thay vì xây vách tường bê tông thô cứng làm chia cắt không gian, bạn hãy sử dụng bình phong mây tre đan hoặc kệ gỗ trang trí khung thưa. Vách ngăn thoáng vừa phân chia ranh giới riêng tư giữa phòng khách và giường ngủ, vừa đảm bảo luồng không khí luôn lưu thông mát mẻ.</p>
    `
  },
  {
    id: 6,
    blog_id: "B0006",
    title: "Xu Hướng Thiết Kế Nội Thất Tối Giản Bắc Âu Nordic 2026",
    category: "Phòng khách",
    date: "05/08/2026",
    excerpt: "Cập nhật các phong cách thiết kế bùng nổ năm 2026: Đồ gốm men mờ, chất liệu vải dạ thô mộc kết hợp cùng xu hướng sống xanh bền vững.",
    img: "/assets/images/banner/banner-trang-chu-mini-shop.webp",
    author: "Biên tập viên Mini Shop",
    read_time: "10 phút đọc",
    content: `
      <p>Xu hướng nội thất năm 2026 chứng kiến sự tôn vinh trọn vẹn các chất liệu tự nhiên bền vững và sự tối giản mang chiều sâu cảm xúc (Warm Minimalism).</p>
      <p>Người dùng ngày càng tìm kiếm sự tĩnh lặng và chữa lành ngay trong không gian sống của chính mình. Những thiết kế quá cầu kỳ phức tạp nhường chỗ cho vẻ đẹp mộc mạc, gần gũi với thiên nhiên.</p>

      <h2>1. Sự Lên Ngôi Của Đồ Gốm Men Mờ & Men Thủ Công</h2>
      <p>Những bộ bình gốm sứ với bề mặt men mờ (Matte Glaze) màu đất nung, xám ngọc hoặc xám đá mộc mạc đang trở thành điểm nhấn không thể thiếu trên bàn trà và tủ console trang trí phong cách Bắc Âu.</p>

      <div class="article-quote">
        "Nội thất năm 2026 hướng về sự tĩnh lặng nội tâm, nơi mỗi món đồ mộc mạc đều kể một câu chuyện bình yên."
      </div>

      <h2>2. Xu Hướng Sống Xanh Bền Vững Eco-Friendly</h2>
      <p>Gia chủ ngày càng ưu tiên lựa chọn đồ nội thất chế tác từ gỗ sồi đạt chứng chỉ FSC, sơn mài tự nhiên và các sản phẩm đan tre thủ công không chứa hóa chất độc hại, đảm bảo an toàn tuyệt đối cho sức khỏe lâu dài.</p>

      <h2>3. Sự Kết Hợp Vải Dệt Tự Nhiên Linen & Wool Thô Mộc</h2>
      <p>Rèm cửa vải lanh Linen và chăn len dệt sợi tự nhiên mang lại cảm giác dễ chịu, thấm hút mồ hôi và cực kỳ thoáng mát vào mùa hè nhưng vẫn giữ ấm êm ái khi mùa đông về.</p>
    `
  },
  {
    id: 7,
    blog_id: "B0007",
    title: "Bí Quyết Chọn Chậu Cây Decor Đạt Chuẩn Phong Thủy",
    category: "Trang trí",
    date: "02/08/2026",
    excerpt: "Top các loại cây trồng trong nhà giúp thanh lọc không khí, mang lại giấc ngủ ngon và đem đến tài lộc vượng khí cho gia chủ.",
    img: "/assets/images/products/noi-that-gia-dung/chau-cay-de-ban.webp",
    author: "Chuyên gia Phong Thủy Minh Đức",
    read_time: "9 phút đọc",
    content: `
      <p>Cây cảnh decor không chỉ là món phụ kiện trang trí giúp căn phòng tràn ngập sức sống mà còn đóng vai trò cân bằng nguồn năng lượng sinh khí theo quan niệm phong thủy Á Đông.</p>
      <p>Mỗi loại cây sở hữu dáng lá và năng lượng ngũ hành khác nhau. Việc chọn đúng chậu cây phù hợp mệnh gia chủ và đặt tại các góc vượng khí sẽ thu hút may mắn và tài lộc dồi dào.</p>

      <h2>1. Chọn Cây Lá Tròn Mang Lại Sự Hòa Thuận</h2>
      <p>Các loại cây có tán lá tròn trịa như Cây Kim Tiền, Cây Bàng Đài Loan hay Cây Trầu Bà Thanh Xuân tượng trưng cho sự viên mãn, sung túc và tài lộc dồi dào cho gia chủ.</p>

      <div class="article-quote">
        "Màu xanh của lá cây là nguồn năng lượng sinh khí tinh khiết nhất giúp xua tan căng thẳng và thu hút tài lộc."
      </div>

      <h2>2. Đặt Cây Ở Vị Trí Chiêu Tài Phòng Khách</h2>
      <p>Góc sofa phòng khách hoặc đôn gỗ cạnh kệ TV là những vị trí vàng để đặt chậu cây cảnh. Sắc xanh tươi mới sẽ kích hoạt dòng năng lượng tích cực cho toàn bộ không gian sống.</p>

      <h2>3. Chọn Chất Liệu Chậu Gốm Sứ Thô Mộc Thoát Nước Tốt</h2>
      <p>Chậu gốm mộc nung thủ công với lỗ thoát nước thông thoáng giúp rễ cây không bị ngập úng, đồng thời bổ sung yếu tố Thổ cân bằng cho căn phòng.</p>
    `
  },
  {
    id: 8,
    blog_id: "B0008",
    title: "Nghệ Thuật Khử Mùi & Đánh Bóng Đồ Gỗ Sồi Tự Nhiên",
    category: "Phòng ngủ",
    date: "30/07/2026",
    excerpt: "Hướng dẫn các bước lau chùi, đánh bóng bằng sáp tự nhiên giúp giữ nguyên vẻ đẹp mộc mạc và vân gỗ quyến rũ của bộ bàn ghế gỗ sồi.",
    img: "/assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp",
    author: "Nghệ nhân Nguyễn Văn Tâm",
    read_time: "8 phút đọc",
    content: `
      <p>Bàn ăn và tủ kệ gỗ sồi là tâm điểm đắt giá trong ngôi nhà. Để bảo vệ lớp vân gỗ tuyệt đẹp và hương thơm mộc mạc ban đầu, gia chủ cần trang bị quy trình bảo dưỡng chuẩn kỹ thuật.</p>

      <h2>1. Đánh Bóng Bằng Sáp Ong Tự Nhiên</h2>
      <p>Thoa nhẹ một lớp sáp ong hoặc dầu lau gỗ sồi chuyên dụng 6 tháng/lần. Sáp ong thẩm thấu sâu vào thớ gỗ, tạo lớp màng bảo vệ kháng ẩm mốc và phục hồi độ sáng bóng rực rỡ như mới.</p>

      <div class="article-quote">
        "Chăm sóc đồ gỗ như chăm sóc một sinh mệnh, sự tỉ mỉ của bạn sẽ được đền đáp bằng vẻ đẹp trường tồn qua năm tháng."
      </div>

      <h2>2. Lau Chùi Ngay Các Vết Ẩm Nước</h2>
      <p>Dù bề mặt gỗ sồi đã phủ sơn PU chống thấm, bạn vẫn nên lau sạch ngay các giọt nước đọng trên mặt bàn để tránh hiện tượng ngấm ố vàng theo thời gian.</p>

      <h2>3. Khử Mùi Ẩm Bằng Bã Cà Phê Hoặc Túi Than Hoạt Tính</h2>
      <p>Đặt một chén bã cà phê phơi khô hoặc túi than hoạt tính bên trong ngăn kéo tủ gỗ sồi để hút ẩm và khử sạch hoàn toàn mùi ẩm mốc khó chịu.</p>
    `
  },
  {
    id: 9,
    blog_id: "B0009",
    title: "Tối Ưu Góc Làm Việc Nhỏ Gọn Tại Nhà Phong Cách Nordic",
    category: "Phòng ngủ",
    date: "26/07/2026",
    excerpt: "Thiết kế góc làm việc tại nhà chuẩn Ergonomic tối giản, truyền cảm hứng sáng tạo và tập trung cao độ mỗi ngày.",
    img: "/assets/images/products/do-thu-cong/khay-go-trang-tri.webp",
    author: "KTS. Lê Hoàng Nam",
    read_time: "9 phút đọc",
    content: `
      <p>Góc làm việc tại nhà yên tĩnh và thẩm mỹ giúp nhân đôi hiệu suất công việc và khơi nguồn cảm hứng sáng tạo dồi dào.</p>

      <h2>1. Tận Dụng Ánh Sáng Cửa Sổ Tự Nhiên</h2>
      <p>Đặt bàn làm việc vuông góc với cửa sổ để tận dụng nguồn ánh sáng tự nhiên chan hòa, giúp mắt không bị mỏi khi làm việc máy tính nhiều giờ liền.</p>

      <div class="article-quote">
        "Không gian làm việc ngăn nắp là tiền đề của một tư duy mạch lạc và những ý tưởng đột phá."
      </div>

      <h2>2. Sử Dụng Khay Gỗ & Hộp Đựng Đồ Gọn Gàng</h2>
      <p>Giữ cho mặt bàn luôn ngăn nắp với khay gỗ sồi chia ô và hộp đựng bút bằng đan tre mộc mạc. Sự gọn gàng là yếu tố cốt lõi giúp tâm trí luôn minh mẫn tập trung.</p>

      <h2>3. Bổ Sung Đèn Bàn LED Ánh Sáng Bảo Vệ Mắt</h2>
      <p>Một chiếc đèn bàn thiết kế tối giản với chỉ số hoàn màu CRI > 90 giúp tái tạo màu sắc trung thực và giảm thiểu ánh sáng xanh gây hại thị lực.</p>
    `
  },
  {
    id: 10,
    blog_id: "B0010",
    title: "Quy Trình Chống Ẩm Mốc Đồ Tre Mây Vào Mùa Nồm Ẩm",
    category: "Lưu trữ",
    date: "22/07/2026",
    excerpt: "Các mẹo dân gian và khoa học giúp bảo vệ đồ mây tre đan luôn khô ráo, không bị mốc trắng hay bốc mùi trong thời tiết nồm ẩm.",
    img: "/assets/images/products/do-thu-cong/tranh-treo-macrame.webp",
    author: "Nghệ nhân Nguyễn Văn Tâm",
    read_time: "8 phút đọc",
    content: `
      <p>Mùa nồm ẩm miền Bắc là thử thách lớn đối với các sản phẩm làm từ mây tre tự nhiên. Hãy bỏ túi quy trình 3 bước bảo vệ đồ mây tre luôn bền đẹp.</p>

      <h2>1. Đóng Kín Cửa & Sử Dụng Máy Hút Ẩm</h2>
      <p>Khi độ ẩm không khí vượt quá 80%, tuyệt đối không mở cửa phòng thoáng gió vì không khí ẩm sẽ ngấm trực tiếp vào nan tre. Bật máy hút ẩm duy trì mức 60% là giải pháp tối ưu nhất.</p>

      <div class="article-quote">
        "Phòng bệnh hơn chữa bệnh - giữ độ ẩm phòng ổn định là chìa khóa vàng bảo vệ đồ thủ công mây tre."
      </div>

      <h2>2. Sấy Khô Bằng Máy Sấy Tóc Khi Phát Hiện Ẩm</h2>
      <p>Nếu thấy nan tre bị đọng sương ẩm nhẹ, dùng máy sấy tóc chế độ gió ấm thổi khô nhẹ nhàng từng kẽ đan để làm bay hơi nước tức thì.</p>

      <h2>3. Phủ Lớp Dầu Khoáng Bảo Vệ Bề Mặt Định Kỳ</h2>
      <p>Dùng khăn mềm thấm một lượng nhỏ dầu khoáng lau đều lên các nan tre để tạo lớp màng kỵ nước tự nhiên ngăn chặn ẩm mốc xâm nhập.</p>
    `
  }
];

async function run() {
  console.log("Updating Supabase blogs table with full rich editorial content...");
  for (const b of BLOGS_DATA) {
    const { error } = await supabase
      .from("blogs")
      .upsert({
        id: b.id,
        blog_id: b.blog_id,
        title: b.title,
        category: b.category,
        date: b.date,
        excerpt: b.excerpt,
        img: b.img,
        author: b.author,
        read_time: b.read_time,
        content: b.content.trim(),
      }, { onConflict: "id" });

    if (error) {
      console.error(`Error updating blog ${b.id}:`, error.message);
    } else {
      console.log(`✓ Blog ${b.id} (${b.title}) updated successfully!`);
    }
  }
  console.log("Done!");
}

run();
