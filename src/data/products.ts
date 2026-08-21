import { Product } from "@/types/product";

export const PRODUCTS_DATA: Product[] = [
  // --- NỘI THẤT & GIA DỤNG ---
  {
    id: 1,
    name: "Sofa Vải Hiện Đại Nordic",
    category: "Living Room",
    categoryName: "Phòng khách",
    price: 2990000,
    oldPrice: 3500000,
    status: "In stock",
    badge: "Mới",
    badgeType: "badge-new",
    image: "assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp",
    description: "Sofa bọc vải nỉ cao cấp phong cách Bắc Âu Nordic tối giản, đem lại sự sang trọng và thoải mái cho không gian phòng khách.",
    fullDesc: "Ghế Sofa Vải Hiện Đại Nordic là sự kết hợp hoàn hảo giữa thiết kế Scandinavian tối giản và tính năng thư giãn vượt trội. Nệm đệm cao su bọt biển độ đàn hồi cao không bị xẹp lép theo thời gian. Khung gỗ tự nhiên đã qua xử lý chống mối mọt chắc chắn.",
    specs: {
      "Chất liệu": "Vải nỉ cao cấp, Khung gỗ Tần bì",
      "Màu sắc": "Xám ghi, Xanh Navy, Kem",
      "Kích thước": "180 x 80 x 75 cm (D x R x C)",
      "Trọng lượng": "28 kg",
      "Xuất xứ": "Việt Nam (Tiêu chuẩn xuất khẩu)"
    }
  },
  {
    id: 2,
    name: "Bàn Ăn Gỗ Sồi Tự Nhiên",
    category: "Kitchen",
    categoryName: "Nhà bếp",
    price: 3490000,
    oldPrice: 3890000,
    status: "In stock",
    badge: "Mới",
    badgeType: "badge-new",
    image: "assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp",
    description: "Bàn ăn chế tác từ 100% gỗ sồi tự nhiên nhập khẩu, bề mặt phủ sơn PU mờ chống nước và chống trầy xước.",
    fullDesc: "Bộ Bàn Ăn Gỗ Sồi Tự Nhiên mang đến sự ấm cúng cho căn bếp gia đình bạn. Mặt bàn dày dặn vân gỗ tự nhiên độc đáo, các góc cạnh được bo tròn an toàn cho trẻ nhỏ.",
    specs: {
      "Chất liệu": "Gỗ sồi (Oak) tự nhiên 100%",
      "Màu sắc": "Vàng gỗ tự nhiên, Nâu gụ",
      "Kích thước": "140 x 80 x 75 cm",
      "Trọng lượng": "22 kg",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 3,
    name: "Giường Gỗ Sồi Hiện Đại Nordic",
    category: "Bedroom",
    categoryName: "Phòng ngủ",
    price: 4990000,
    oldPrice: 5490000,
    status: "In stock",
    badge: "Hot",
    badgeType: "badge-new",
    image: "assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp",
    description: "Giường ngủ chất liệu gỗ sồi chắc chắn, thiết kế nan vạt cong nâng đỡ cột sống tạo giấc ngủ ngon mỗi ngày.",
    fullDesc: "Giường Gỗ Sồi Hiện Đại Nordic sở hữu kết cấu khung chịu lực chắc chắn, không gây tiếng kêu cót két khi sử dụng. Thiết kế tối giản tinh tế phù hợp với nhiều phong cách trang trí phòng ngủ hiện đại.",
    specs: {
      "Chất liệu": "Gỗ sồi Mỹ nhập khẩu",
      "Màu sắc": "Màu gỗ tự nhiên",
      "Kích thước": "160 x 200 cm (Lòng giường)",
      "Trọng lượng": "45 kg",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 4,
    name: "Tủ Đầu Giường Gỗ Tự Nhiên",
    category: "Bedroom",
    categoryName: "Phòng ngủ",
    price: 790000,
    oldPrice: 950000,
    status: "In stock",
    badge: "Mới",
    badgeType: "badge-new",
    image: "assets/images/products/noi-that-gia-dung/ke-go-trang-tri.webp",
    description: "Tủ đầu giường nhỏ gọn tích hợp 2 ngăn kéo tiện lợi, bảo quản vật dụng cá nhân ngăn nắp bên giường ngủ.",
    fullDesc: "Tủ Đầu Giường Gỗ Tự Nhiên là phụ kiện không thể thiếu cho phòng ngủ hiện đại. Ray trượt ngăn kéo êm ái, chân gỗ tròn cao giúp dễ dàng vệ sinh gầm tủ.",
    specs: {
      "Chất liệu": "Gỗ cao su / Gỗ sồi tự nhiên",
      "Màu sắc": "Vàng mộc, Trắng phối gỗ",
      "Kích thước": "45 x 40 x 50 cm",
      "Trọng lượng": "8.5 kg",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 5,
    name: "Kệ Gỗ Trang Trí Đa Năng",
    category: "Storage",
    categoryName: "Lưu trữ",
    price: 890000,
    oldPrice: 1100000,
    status: "In stock",
    badge: "Mới",
    badgeType: "badge-new",
    image: "assets/images/products/noi-that-gia-dung/ke-go-trang-tri.webp",
    description: "Kệ gỗ nhiều tầng trang trí phòng khách hoặc phòng làm việc, tối ưu diện tích lưu trữ sách và cây cảnh.",
    fullDesc: "Kệ Gỗ Trang Trí Đa Năng thiết kế các ô ngăn cách điệu hiện đại. Chịu lực tốt mỗi tầng lên tới 15kg, giúp sắp xếp sách vở, đồ trang trí gọn gàng bắt mắt.",
    specs: {
      "Chất liệu": "Gỗ công nghiệp MDF phủ Melamine cao cấp",
      "Màu sắc": "Vân gỗ Sồi, Trắng",
      "Kích thước": "60 x 28 x 120 cm",
      "Trọng lượng": "12 kg",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 6,
    name: "Chậu Cây Trồng Trong Nhà",
    category: "Decor",
    categoryName: "Trang trí",
    price: 190000,
    oldPrice: 240000,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/noi-that-gia-dung/chau-cay-de-ban.webp",
    description: "Chậu gốm nung men mát kèm chân đôn gỗ, thích hợp trồng các loại cây cảnh mướt mắt cho bàn làm việc.",
    fullDesc: "Chậu Cây Trồng Trong Nhà mang mảng xanh tươi mát vào góc sống của bạn. Đáy chậu có lỗ thoát nước thông minh chống ngập úng rễ.",
    specs: {
      "Chất liệu": "Gốm Bát Tràng, Đôn gỗ cao su",
      "Màu sắc": "Trắng sứ, Xám xi măng",
      "Kích thước": "Đường kính 18cm, Cao 22cm",
      "Trọng lượng": "1.5 kg",
      "Xuất xứ": "Bát Tràng, Việt Nam"
    }
  },

  // --- ĐỒ MỸ NGHỆ ---
  {
    id: 7,
    name: "Đèn Tre Thủ Công Minimal",
    category: "Lighting",
    categoryName: "Đèn chiếu sáng",
    price: 290000,
    oldPrice: 340000,
    status: "In stock",
    badge: "-15%",
    badgeType: "badge-sale",
    image: "assets/images/products/do-my-nghe/den-tre-thu-cong.webp",
    description: "Đèn treo đan bằng tre tự nhiên xun mây xử lý chống mốc, tỏa ánh sáng vàng ấm áp thư thái.",
    fullDesc: "Đèn Tre Thủ Công Minimal được làm thủ công tỉ mỉ từ các nghệ nhân làng nghề. Thiết kế tạo hiệu ứng hiệu ứng bóng đổ hoa văn độc đáo lên tường khi bật sáng.",
    specs: {
      "Chất liệu": "Tre tự nhiên đã qua sấy chống mối mọt",
      "Màu sắc": "Vàng tre mộc",
      "Kích thước": "Đường kính 30cm, Cao 25cm",
      "Bóng đèn": "LED Đui E27 ánh sáng vàng 4W",
      "Xuất xứ": "Làng nghề mây tre đan Việt Nam"
    }
  },
  {
    id: 8,
    name: "Đèn Lồng Tre Mỹ Nghệ",
    category: "Lighting",
    categoryName: "Đèn chiếu sáng",
    price: 350000,
    oldPrice: 420000,
    status: "In stock",
    badge: "Hot",
    badgeType: "badge-new",
    image: "assets/images/products/do-my-nghe/den-long-tre.webp",
    description: "Đèn lồng tre mỹ nghệ phong cách hoài cổ, lý tưởng trang trí nhà hàng, quán cafe hoặc ban công.",
    fullDesc: "Đèn Lồng Tre Mỹ Nghệ có cấu trúc nan tre đan xen chắc chắn, phủ lớp sơn bóng mờ chống ẩm. Tạo cảm giác đầm ấm và đậm chất nghệ thuật dân gian.",
    specs: {
      "Chất liệu": "Nan tre chẻ thủ công, Khung sắt sơn tĩnh điện",
      "Màu sắc": "Nâu đỏ trầm, Vàng mộc",
      "Kích thước": "Đường kính 35cm, Cao 40cm",
      "Trọng lượng": "0.8 kg",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 9,
    name: "Bình Gốm Trang Trí Dáng Cao",
    category: "Decor",
    categoryName: "Trang trí",
    price: 320000,
    oldPrice: 400000,
    status: "In stock",
    badge: "-20%",
    badgeType: "badge-sale",
    image: "assets/images/products/do-my-nghe/binh-gom-trang-tri.webp",
    description: "Bình gốm thủ công dáng cao vuốt tay, họa tiết men rạn độc bản tô điểm không gian sống tinh tế.",
    fullDesc: "Bình Gốm Trang Trí Dáng Cao là sản phẩm mỹ nghệ vuốt tay thủ công từ đất sét cao cấp. Phù hợp cắm các loại hoa cành dài như hoa dơn, sen, ly hoặc để mộc decor kệ tủ.",
    specs: {
      "Chất liệu": "Gốm sứ cao cấp nung 1200 độ C",
      "Màu sắc": "Men hỏa biến, Men rạn cổ",
      "Kích thước": "Mặt 10cm, Cao 32cm",
      "Trọng lượng": "1.8 kg",
      "Xuất xứ": "Bát Tràng, Việt Nam"
    }
  },
  {
    id: 10,
    name: "Bộ Bình Gốm Minimal Nhật Bản",
    category: "Decor",
    categoryName: "Trang trí",
    price: 450000,
    oldPrice: 550000,
    status: "In stock",
    badge: "Bán chạy",
    badgeType: "badge-new",
    image: "assets/images/products/do-my-nghe/bo-binh-gom-minimal.webp",
    description: "Bộ 3 bình gốm phong cách Wabi-sabi Nhật Bản, đường nét mộc mạc thư thái cho góc trà đạo.",
    fullDesc: "Bộ Bình Gốm Minimal Nhật Bản đem đến triết lý vẻ đẹp mộc mạc tự nhiên vào ngôi nhà. Bề mặt men nhám sờ mịn tay với tông màu trung tính dễ phối hợp không gian.",
    specs: {
      "Chất liệu": "Gốm mộc nung nhiệt độ cao",
      "Màu sắc": "Xám tro, Kem đất, Đen nhám",
      "Kích thước": "Bộ 3 bình (Cao 20cm, 15cm, 10cm)",
      "Trọng lượng": "2.2 kg (cả bộ)",
      "Xuất xứ": "Việt Nam"
    }
  },

  // --- ĐỒ THỦ CÔNG ---
  {
    id: 11,
    name: "Giỏ Mây Đan Lưu Trữ",
    category: "Storage",
    categoryName: "Lưu trữ",
    price: 140000,
    oldPrice: 180000,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/do-thu-cong/gio-may-dan.webp",
    description: "Giỏ đan từ sợi mây tự nhiên có quai xách tiện dụng, đựng quần áo, đồ chơi hoặc mỹ phẩm.",
    fullDesc: "Giỏ Mây Đan Lưu Trữ mang hương vị thiên nhiên gần gũi. Sợi mây dai bền đã qua xử lý chống mốc, quai xách chắc chắn chịu lực lên tới 8kg.",
    specs: {
      "Chất liệu": "100% Sợi mây tự nhiên",
      "Màu sắc": "Màu mây tự nhiên",
      "Kích thước": "32 x 25 x 20 cm",
      "Trọng lượng": "0.4 kg",
      "Xuất xứ": "Làng nghề mây đan Việt Nam"
    }
  },
  {
    id: 12,
    name: "Tranh Treo Tường Macrame",
    category: "Decor",
    categoryName: "Trang trí",
    price: 280000,
    oldPrice: 320000,
    status: "In stock",
    badge: "-12%",
    badgeType: "badge-sale",
    image: "assets/images/products/do-thu-cong/tranh-treo-macrame.webp",
    description: "Tranh thắt dây Macrame phong cách Boho phóng khoáng, thanh gỗ thông tự nhiên tạo điểm nhấn mảng tường.",
    fullDesc: "Tranh Treo Tường Macrame thắt nốt thủ công tỉ mỉ từng chi tiết. Chất liệu sợi cotton tự nhiên thân thiện với môi trường, tạo vẻ đẹp thơ mộng ấm áp cho phòng ngủ.",
    specs: {
      "Chất liệu": "Sợi Cotton 100%, Thanh gỗ Thông",
      "Màu sắc": "Trắng kem ngà",
      "Kích thước": "Rộng 45cm, Dài 70cm",
      "Trọng lượng": "0.5 kg",
      "Xuất xứ": "Handmade Việt Nam"
    }
  },
  {
    id: 13,
    name: "Khay Gỗ Khảm Hoa Văn",
    category: "Kitchen",
    categoryName: "Nhà bếp",
    price: 210000,
    oldPrice: 260000,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/do-thu-cong/khay-go-hoa-van.webp",
    description: "Khay phục vụ bằng gỗ tự nhiên khảm họa tiết hình học tinh xảo, bưng trà bánh tiếp khách sang trọng.",
    fullDesc: "Khay Gỗ Khảm Hoa Văn kết hợp giữa chất liệu gỗ nguyên khối và kỹ thuật khảm hoa văn độc đáo. Tay cầm hai bên tiện lợi cho việc di chuyển đồ dùng trà bánh.",
    specs: {
      "Chất liệu": "Gỗ xà cừ / Gỗ tần bì",
      "Màu sắc": "Nâu gỗ mộc phối trắng",
      "Kích thước": "38 x 26 x 4 cm",
      "Trọng lượng": "0.7 kg",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 14,
    name: "Khay Gỗ Trang Trí Đồ Ăn",
    category: "Kitchen",
    categoryName: "Nhà bếp",
    price: 175000,
    oldPrice: 210000,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/do-thu-cong/khay-go-trang-tri.webp",
    description: "Khay đĩa gỗ hình chữ nhật dùng decor món ăn, bánh ngọt chụp ảnh món ăn cuốn hút.",
    fullDesc: "Khay Gỗ Trang Trí Đồ Ăn được xử lý bằng dầu lau thực vật an toàn tuyệt đối cho sức khỏe. Giúp các bữa ăn gia đình hay chụp ảnh concept food thêm phần hấp dẫn.",
    specs: {
      "Chất liệu": "Gỗ Dừa / Gỗ Tần bì tự nhiên",
      "Màu sắc": "Nâu ấm vân gỗ",
      "Kích thước": "30 x 18 x 2 cm",
      "Trọng lượng": "0.4 kg",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 15,
    name: "Hộp Sơn Mài Khảm Xà Cừ",
    category: "Decor",
    categoryName: "Trang trí",
    price: 490000,
    oldPrice: 550000,
    status: "In stock",
    badge: "Bán chạy",
    badgeType: "badge-new",
    image: "assets/images/products/đồ mỹ nghệ/hop-son-mai.webp",
    description: "Hộp nữ trang sơn mài truyền thống khảm vỏ trai óng ánh, lót nhung bảo vệ trang sức cao cấp.",
    fullDesc: "Hộp Sơn Mài Khảm Xà Cừ trải qua 12 bước sơn mài thủ công truyền thống. Họa tiết khảm trai lấp lánh phản chiếu ánh sáng sang trọng, món quà tặng ý nghĩa cho người thân.",
    specs: {
      "Chất liệu": "Gỗ sơn mài, Khảm vỏ xà cừ tự nhiên, Lót nhung",
      "Màu sắc": "Đen bóng khảm xà cừ, Đỏ đô",
      "Kích thước": "20 x 12 x 8 cm",
      "Trọng lượng": "0.9 kg",
      "Xuất xứ": "Làng nghề Sơn Mài Hạ Thái, Việt Nam"
    }
  },
  {
    id: 16,
    name: "Khay Khảm Trai Cao Cấp",
    category: "Kitchen",
    categoryName: "Nhà bếp",
    price: 380000,
    oldPrice: 450000,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/đồ mỹ nghệ/khay-kham-trai.webp",
    description: "Khay tròn khảm xà cừ tinh xảo trang trí bàn trà hoặc đựng mứt ngày lễ tết vô cùng ấn tượng.",
    fullDesc: "Khay Khảm Trai Cao Cấp được ghép thủ công tỉ mỉ từng mảnh vỏ trai biển. Bề mặt phủ nhựa trong suốt bảo vệ độ bền đĩa không bị bong tróc hay ngấm nước.",
    specs: {
      "Chất liệu": "Khảm trai tự nhiên, Cốt gỗ MDF chống ẩm",
      "Màu sắc": "Trắng ngọc trai lấp lánh",
      "Kích thước": "Đường kính 30cm, Cao 3cm",
      "Trọng lượng": "0.6 kg",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 17,
    name: "Khay Gỗ Mỹ Nghệ Nguyên Khối",
    category: "Kitchen",
    categoryName: "Nhà bếp",
    price: 260000,
    oldPrice: 320000,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/đồ mỹ nghệ/khay-go-thu-cong.webp",
    description: "Khay gỗ nguyên khối đục đẽo thủ công giữ trọn đường nét vân gỗ mộc tự nhiên độc bản.",
    fullDesc: "Khay Gỗ Mỹ Nghệ Nguyên Khối được làm từ một khối gỗ tự nhiên không ghép nối. Mỗi chiếc khay đều sở hữu đường vân gỗ độc nhất vô nhị không đụng hàng.",
    specs: {
      "Chất liệu": "Gỗ Oliu / Gỗ Xà cừ nguyên khối",
      "Màu sắc": "Nâu tự nhiên",
      "Kích thước": "35 x 20 x 3 cm",
      "Trọng lượng": "0.8 kg",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 18,
    name: "Bộ Bình Gốm Mộc Mỹ Nghệ",
    category: "Decor",
    categoryName: "Trang trí",
    price: 520000,
    oldPrice: 600000,
    status: "In stock",
    badge: "-13%",
    badgeType: "badge-sale",
    image: "assets/images/products/đồ mỹ nghệ/bo-binh-gom-thu-cong.webp",
    description: "Bộ gốm nung củi truyền thống bề mặt thô mộc cá tính, điểm nhấn nghệ thuật cho không gian đương đại.",
    fullDesc: "Bộ Bình Gốm Mộc Mỹ Nghệ được nung thủ công trong lò củi truyền thống ở nhiệt độ cao. Hiệu ứng hỏa biến mộc mạc cho màu men tự nhiên tựa như kiệt tác điêu khắc.",
    specs: {
      "Chất liệu": "Đất sét nung lò củi",
      "Màu sắc": "Nâu đất mộc, Cam củi",
      "Kích thước": "Bộ 2 bình (Cao 25cm và 18cm)",
      "Trọng lượng": "2.5 kg (cả bộ)",
      "Xuất xứ": "Bát Tràng, Việt Nam"
    }
  },
  // --- BÀN ---
  {
    id: 19,
    name: "Bàn Trà Gỗ Tròn Đôi Modern",
    category: "Living Room",
    categoryName: "Phòng khách",
    price: 1850000,
    oldPrice: 2200000,
    stock: 25,
    status: "In stock",
    badge: "Hot",
    badgeType: "badge-new",
    image: "assets/images/products/do-noi-that/ban-2.jpg",
    description: "Bàn trà tròn đôi mặt gỗ sồi chân sắt sơn tĩnh điện phong cách hiện đại cho phòng khách.",
    fullDesc: "Bàn Trà Gỗ Tròn Đôi Modern là giải pháp tuyệt vời cho phòng khách căn hộ chung cư hay nhà phố. Bộ bàn gồm 2 chiếc lồng gọn gàng khi không sử dụng, tiết kiệm diện tích tối đa.",
    specs: {
      "Chất liệu": "Mặt gỗ MDF phủ Melamine, Chân sắt sơn tĩnh điện",
      "Màu sắc": "Vân gỗ sồi, Chân đen",
      "Kích thước": "Bàn lớn D70xH45cm, Bàn nhỏ D50xH40cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 20,
    name: "Bàn Làm Việc Gỗ Khung Sắt Tối Giản",
    category: "Living Room",
    categoryName: "Phòng khách",
    price: 2450000,
    oldPrice: 2900000,
    stock: 30,
    status: "In stock",
    badge: "Mới",
    badgeType: "badge-new",
    image: "assets/images/products/do-noi-that/ban-3.jpg",
    description: "Bàn làm việc khung sắt chắc chắn, thiết kế tối giản hỗ trợ góc làm việc và học tập ngăn nắp.",
    fullDesc: "Bàn Làm Việc Gỗ Khung Sắt Tối Giản được gia công từ khung thép hộp chống rỉ chắc chắn, khả năng chịu lực đến 100kg. Mặt bàn chống nước và trầy xước.",
    specs: {
      "Chất liệu": "Gỗ công nghiệp chống ẩm, Khung thép sơn tĩnh điện",
      "Màu sắc": "Gỗ sáng, Khung đen",
      "Kích thước": "120 x 60 x 75 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 21,
    name: "Bàn Sofa Mặt Đá Vân Mây Sang Trọng",
    category: "Living Room",
    categoryName: "Phòng khách",
    price: 3600000,
    oldPrice: 4100000,
    stock: 15,
    status: "In stock",
    badge: "-12%",
    badgeType: "badge-sale",
    image: "assets/images/products/do-noi-that/ban-4.jpg",
    description: "Bàn sofa mặt đá ceramic vân mây bóng bẩy, chân mạ vàng tạo điểm nhấn tinh tế.",
    fullDesc: "Bàn Sofa Mặt Đá Vân Mây Sang Trọng mang lại khí chất hiện đại, thời thượng. Đá Ceramic chịu nhiệt, chống xước hoàn hảo.",
    specs: {
      "Chất liệu": "Mặt đá Ceramic vân mây, Khung inox mạ PVD vàng",
      "Màu sắc": "Đá trắng vân mây, Khung vàng bóng",
      "Kích thước": "130 x 70 x 45 cm",
      "Xuất xứ": "Nhập khẩu"
    }
  },
  {
    id: 22,
    name: "Bàn Trà Gỗ Nguyên Khối Rustic",
    category: "Living Room",
    categoryName: "Phòng khách",
    price: 2100000,
    oldPrice: 2500000,
    stock: 18,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/do-noi-that/ban-5.jpg",
    description: "Bàn trà phong cách mộc mạc Rustic giữ nguyên đường nét vân gỗ tự nhiên cuốn hút.",
    fullDesc: "Bàn Trà Gỗ Nguyên Khối Rustic tôn vinh nét đẹp chân thực của chất liệu gỗ mộc. Thích hợp bài trí không gian trà đạo hay quán cà phê cao cấp.",
    specs: {
      "Chất liệu": "Gỗ me tây / Gỗ tràm tự nhiên",
      "Màu sắc": "Nâu mộc tự nhiên",
      "Kích thước": "100 x 50 x 40 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  // --- GHẾ ---
  {
    id: 23,
    name: "Ghế Thư Giãn Bọc Nỉ Bông Nordic",
    category: "Living Room",
    categoryName: "Phòng khách",
    price: 1450000,
    oldPrice: 1800000,
    stock: 40,
    status: "In stock",
    badge: "Mới",
    badgeType: "badge-new",
    image: "assets/images/products/do-noi-that/ghe-1.jpg",
    description: "Ghế đệm nỉ bông êm ái thích hợp đọc sách, thư giãn phòng khách hoặc phòng ngủ.",
    fullDesc: "Ghế Thư Giãn Bọc Nỉ Bông Nordic tựa lưng ôm sát sống lưng tạo sự thoải mái tối đa cho người ngồi trong thời gian dài.",
    specs: {
      "Chất liệu": "Nỉ bông cao cấp, Chân gỗ sồi",
      "Màu sắc": "Ghi xám, Kem, Xanh pastel",
      "Kích thước": "75 x 70 x 85 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 24,
    name: "Ghế Ăn Gỗ Tự Nhiên Bọc Da Eames",
    category: "Kitchen",
    categoryName: "Nhà bếp",
    price: 890000,
    oldPrice: 1100000,
    stock: 50,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/do-noi-that/ghe-2.jpg",
    description: "Ghế ăn khung gỗ tự nhiên bọc đệm da PU dễ lau chùi cho căn bếp ấm cúng.",
    fullDesc: "Ghế Ăn Gỗ Tự Nhiên Bọc Da Eames sở hữu kiểu dáng hiện đại, đệm ngồi êm ái chống thấm nước.",
    specs: {
      "Chất liệu": "Khung gỗ cao su, Mặt nệm bọc da PU",
      "Màu sắc": "Nâu gỗ, Đệm đen / Nâu",
      "Kích thước": "45 x 48 x 82 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 25,
    name: "Ghế Sofa Đơn Thư Giãn Cao Cấp",
    category: "Living Room",
    categoryName: "Phòng khách",
    price: 2290000,
    oldPrice: 2700000,
    stock: 20,
    status: "In stock",
    badge: "-15%",
    badgeType: "badge-sale",
    image: "assets/images/products/do-noi-that/ghe-3.jpg",
    description: "Ghế sofa đơn thiết kế bọc nệm dày dặn mang đến trải nghiệm ngả lưng êm ái.",
    fullDesc: "Ghế Sofa Đơn Thư Giãn Cao Cấp là mảnh ghép điểm nhấn hoàn hảo cho không gian phòng khách hiện đại.",
    specs: {
      "Chất liệu": "Vải nỉ nhung, Đệm bọt biển đàn hồi",
      "Màu sắc": "Xanh Rêu, Vàng Mù Tạt, Xám",
      "Kích thước": "85 x 80 x 78 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 26,
    name: "Ghế Đôn Tròn Bọc Vải Nhung Tinh Tế",
    category: "Living Room",
    categoryName: "Phòng khách",
    price: 490000,
    oldPrice: 650000,
    stock: 35,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/do-noi-that/ghe-4.jpg",
    description: "Ghế đôn nhỏ gọn bọc nhung mịn màng dùng làm ghế trang điểm hoặc ghế phụ phòng khách.",
    fullDesc: "Ghế Đôn Tròn Bọc Vải Nhung Tinh Tế có đường viền inox mạ vàng sang trọng, di chuyển linh hoạt.",
    specs: {
      "Chất liệu": "Vải nhung, Chân đế inox mạ vàng",
      "Màu sắc": "Hồng phấn, Xám bạc, Xanh ngọc",
      "Kích thước": "D35 x H42 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 27,
    name: "Ghế Thư Giãn Khung Gỗ Cong Scandinavian",
    category: "Living Room",
    categoryName: "Phòng khách",
    price: 1950000,
    oldPrice: 2300000,
    stock: 15,
    status: "In stock",
    badge: "Hot",
    badgeType: "badge-new",
    image: "assets/images/products/do-noi-that/ghe-5.jpg",
    description: "Ghế bành uốn cong nghệ thuật Scandinavian phong cách Bắc Âu thanh lịch.",
    fullDesc: "Ghế Thư Giãn Khung Gỗ Cong Scandinavian ứng dụng kỹ thuật uốn gỗ hơi nước tiên tiến, khả năng nâng đỡ trơn tru.",
    specs: {
      "Chất liệu": "Gỗ dán ép uốn cong, Đệm nỉ tháo rời",
      "Màu sắc": "Gỗ tự nhiên, Nệm xám",
      "Kích thước": "68 x 80 x 92 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  // --- GIƯỜNG ---
  {
    id: 28,
    name: "Giường Bọc Nệm Phong Cách Châu Âu",
    category: "Bedroom",
    categoryName: "Phòng ngủ",
    price: 6890000,
    oldPrice: 7500000,
    stock: 12,
    status: "In stock",
    badge: "Mới",
    badgeType: "badge-new",
    image: "assets/images/products/do-noi-that/giuong-1.jpg",
    description: "Giường ngủ bọc nỉ cao cấp thiết kế đầu giường rút trán quả trám phong cách tân cổ điển Châu Âu.",
    fullDesc: "Giường Bọc Nệm Phong Cách Châu Âu mang lại nét quý phái cho không gian phòng ngủ của gia chủ.",
    specs: {
      "Chất liệu": "Khung gỗ tự nhiên, Nệm nỉ chống bám bụi",
      "Màu sắc": "Kem tân cổ điển, Xám nhạt",
      "Kích thước": "180 x 200 cm (Lòng giường)",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 29,
    name: "Giường Gỗ Tự Nhiên Tích Hợp Ngăn Kéo",
    category: "Bedroom",
    categoryName: "Phòng ngủ",
    price: 5990000,
    oldPrice: 6600000,
    stock: 10,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/do-noi-that/giuong-2.jpg",
    description: "Giường ngủ tích hợp 2 ngăn kéo bên hông tối ưu không gian cất giữ chăn gối.",
    fullDesc: "Giường Gỗ Tự Nhiên Tích Hợp Ngăn Kéo thông minh là giải pháp lưu trữ tuyệt vời cho phòng ngủ nhỏ.",
    specs: {
      "Chất liệu": "Gỗ sồi tự nhiên, Ngăn kéo ray trượt giảm chấn",
      "Màu sắc": "Vàng gỗ tự nhiên",
      "Kích thước": "160 x 200 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 30,
    name: "Giường Ngủ Tối Giản Khung Gỗ Tần Bì",
    category: "Bedroom",
    categoryName: "Phòng ngủ",
    price: 4590000,
    oldPrice: 5100000,
    stock: 18,
    status: "In stock",
    badge: "-10%",
    badgeType: "badge-sale",
    image: "assets/images/products/do-noi-that/giuong-3.jpg",
    description: "Giường gỗ Tần bì thanh lịch với các đường bo viền tròn tinh xảo an toàn.",
    fullDesc: "Giường Ngủ Tối Giản Khung Gỗ Tần Bì nổi bật với vân gỗ tự nhiên uốn lượn sắc nét, sơn PU mờ cao cấp.",
    specs: {
      "Chất liệu": "Gỗ Tần bì (Ash) nhập khẩu",
      "Màu sắc": "Gỗ sáng mộc",
      "Kích thước": "160 x 200 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 31,
    name: "Giường Ngủ Bọc Vải Nỉ Đầu Giường Mềm Mại",
    category: "Bedroom",
    categoryName: "Phòng ngủ",
    price: 5490000,
    oldPrice: 6200000,
    stock: 14,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/do-noi-that/giuong-4.jpg",
    description: "Giường đầu tựa bọc đệm êm ái nâng đỡ tư thế đọc sách xem phim buổi tối.",
    fullDesc: "Giường Ngủ Bọc Vải Nỉ Đầu Giường Mềm Mại với chân giường nệm chắc chắn, giảm thiểu rung lắc.",
    specs: {
      "Chất liệu": "Đầu giường bọc vải nỉ, Khung gỗ MDF chống ẩm",
      "Màu sắc": "Ghi xám hiện đại",
      "Kích thước": "180 x 200 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 32,
    name: "Giường Ngủ Hiện Đại Khung Gỗ Sồi Nga",
    category: "Bedroom",
    categoryName: "Phòng ngủ",
    price: 6200000,
    oldPrice: 7000000,
    stock: 8,
    status: "In stock",
    badge: "Hot",
    badgeType: "badge-new",
    image: "assets/images/products/do-noi-that/giuong-5.jpg",
    description: "Giường ngủ bằng gỗ sồi Nga nguyên khối chắc chắn, khả năng chống ẩm mối mọt cao.",
    fullDesc: "Giường Ngủ Hiện Đại Khung Gỗ Sồi Nga đã qua xử lý sấy đạt chuẩn xuất khẩu Châu Âu.",
    specs: {
      "Chất liệu": "Gỗ sồi Nga 100%",
      "Màu sắc": "Nâu gụ ấm áp",
      "Kích thước": "180 x 200 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  // --- RÈM CỬA ---
  {
    id: 33,
    name: "Rèm Cửa 2 Lớp Chống Nắng Cao Cấp",
    category: "Curtains",
    categoryName: "Rèm cửa",
    price: 850000,
    oldPrice: 1050000,
    stock: 45,
    status: "In stock",
    badge: "Mới",
    badgeType: "badge-new",
    image: "assets/images/products/do-noi-that/rem-1.jpg",
    description: "Rèm 2 lớp kết hợp vải dệt cản sáng 100% và lụa voan mỏng đón ánh sáng nhẹ.",
    fullDesc: "Rèm Cửa 2 Lớp Chống Nắng Cao Cấp bảo vệ nội thất gia đình khỏi tia UV độc hại.",
    specs: {
      "Chất liệu": "Vải Gấm nỉ + Voan lụa",
      "Màu sắc": "Ghi xám, Vàng kem",
      "Kích thước": "2.5m x 2.7m (Rộng x Cao)",
      "Xuất xứ": "Hàn Quốc"
    }
  },
  {
    id: 34,
    name: "Rèm Vải Voan Trắng Xuyên Sáng Tinh Khôi",
    category: "Curtains",
    categoryName: "Rèm cửa",
    price: 520000,
    oldPrice: 680000,
    stock: 50,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/do-noi-that/rem-2.jpg",
    description: "Rèm voan trắng thêu hoa văn dịu dàng tạo cảm giác bồng bềnh lãng mạn.",
    fullDesc: "Rèm Vải Voan Trắng Xuyên Sáng Tinh Khôi thích hợp làm rèm trang trí cho căn hộ studio.",
    specs: {
      "Chất liệu": "Voan lụa mỏng mịn",
      "Màu sắc": "Trắng tinh khôi",
      "Kích thước": "2.0m x 2.6m",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 35,
    name: "Rèm Cầu Vồng Hàn Quốc Cản Sáng 95%",
    category: "Curtains",
    categoryName: "Rèm cửa",
    price: 990000,
    oldPrice: 1200000,
    stock: 30,
    status: "In stock",
    badge: "-18%",
    badgeType: "badge-sale",
    image: "assets/images/products/do-noi-that/rem-3.jpg",
    description: "Rèm cuốn cầu vồng thông minh linh hoạt điều chỉnh dải sáng theo nhu cầu.",
    fullDesc: "Rèm Cầu Vồng Hàn Quốc Cản Sáng 95% có hệ thống dây kéo mượt mà, độ bền cao.",
    specs: {
      "Chất liệu": "Polyester 100% chống bám bụi",
      "Màu sắc": "Nâu cafe, Xám xì niken",
      "Kích thước": "1.5m x 2.0m",
      "Xuất xứ": "Hàn Quốc"
    }
  },
  {
    id: 36,
    name: "Rèm Roman Xếp Lớp Phong Cách Hiện Đại",
    category: "Curtains",
    categoryName: "Rèm cửa",
    price: 760000,
    oldPrice: 900000,
    stock: 35,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/do-noi-that/rem-4.jpg",
    description: "Rèm Roman xếp tầng vuông vắn gọn gàng cho khung cửa sổ vừa và nhỏ.",
    fullDesc: "Rèm Roman Xếp Lớp Phong Cách Hiện Đại tạo phong thái ngăn nắp sang trọng cho phòng làm việc.",
    specs: {
      "Chất liệu": "Vải bố dệt hoa văn",
      "Màu sắc": "Xanh navy, Xám đậm",
      "Kích thước": "1.2m x 1.8m",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 37,
    name: "Rèm Vải Nỉ Dày Cách Nhiệt Chống Nắng",
    category: "Curtains",
    categoryName: "Rèm cửa",
    price: 1150000,
    oldPrice: 1400000,
    stock: 25,
    status: "In stock",
    badge: "Hot",
    badgeType: "badge-new",
    image: "assets/images/products/do-noi-that/rem-5.jpg",
    description: "Rèm nỉ dày có khả năng cản nhiệt máy lạnh giúp tiết kiệm điện năng.",
    fullDesc: "Rèm Vải Nỉ Dày Cách Nhiệt Chống Nắng hạn chế âm thanh tiếng ồn bên ngoài hiệu quả.",
    specs: {
      "Chất liệu": "Vải nỉ cách nhiệt 3 lớp",
      "Màu sắc": "Ghi xám, Xanh rêu",
      "Kích thước": "3.0m x 2.7m",
      "Xuất xứ": "Nhật Bản"
    }
  },
  // --- TỦ KỆ ---
  {
    id: 38,
    name: "Tủ Kệ Tivi Gỗ Hiện Đại 3 Ngăn Kéo",
    category: "Storage",
    categoryName: "Lưu trữ",
    price: 2890000,
    oldPrice: 3300000,
    stock: 16,
    status: "In stock",
    badge: "Mới",
    badgeType: "badge-new",
    image: "assets/images/products/do-noi-that/tu-ke-1.jpg",
    description: "Tủ kệ Tivi gỗ MDF chống ẩm phối màu sồi tươi sáng sang trọng cho phòng khách.",
    fullDesc: "Tủ Kệ Tivi Gỗ Hiện Đại 3 Ngăn Kéo sở hữu tay nắm âm thẩm mỹ, ngăn kéo rộng rãi.",
    specs: {
      "Chất liệu": "Gỗ MDF lõi xanh chống ẩm",
      "Màu sắc": "Vân gỗ phối Trắng",
      "Kích thước": "160 x 40 x 45 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 39,
    name: "Kệ Sách Gỗ Nhiều Tầng Tối Giản",
    category: "Storage",
    categoryName: "Lưu trữ",
    price: 1350000,
    oldPrice: 1650000,
    stock: 28,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/do-noi-that/tu-ke-2.jpg",
    description: "Kệ sách 5 tầng bằng gỗ tự nhiên nhỏ gọn cho phòng khách và góc học tập.",
    fullDesc: "Kệ Sách Gỗ Nhiều Tầng Tối Giản kết cấu chịu lực chắc chắn, mặt sơn mờ láng mịn.",
    specs: {
      "Chất liệu": "Gỗ cao su tự nhiên 100%",
      "Màu sắc": "Vàng tự nhiên, Nâu gụ",
      "Kích thước": "60 x 30 x 150 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 40,
    name: "Tủ Giày Thông Minh Cánh Lật Tiết Kiệm Diện Tích",
    category: "Storage",
    categoryName: "Lưu trữ",
    price: 1790000,
    oldPrice: 2100000,
    stock: 22,
    status: "In stock",
    badge: "-14%",
    badgeType: "badge-sale",
    image: "assets/images/products/do-noi-that/tu-ke-3.jpg",
    description: "Tủ giày cánh lật 3 tầng chứa đến 25 đôi giày ngăn nắp sạch sẽ.",
    fullDesc: "Tủ Giày Thông Minh Cánh Lật Tiết Kiệm Diện Tích chiều sâu chỉ 24cm cực kỳ gọn gàng.",
    specs: {
      "Chất liệu": "Gỗ công nghiệp Melamine",
      "Màu sắc": "Trắng phối Gỗ sồi",
      "Kích thước": "80 x 24 x 115 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 41,
    name: "Kệ Trang Trí Khung Sắt Mặt Gỗ Hiện Đại",
    category: "Storage",
    categoryName: "Lưu trữ",
    price: 1150000,
    oldPrice: 1400000,
    stock: 30,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/do-noi-that/tu-ke-4.jpg",
    description: "Kệ đứng trang trí chậu cây, quà lưu niệm phong cách công nghiệp Industrial.",
    fullDesc: "Kệ Trang Trí Khung Sắt Mặt Gỗ Hiện Đại chân đế bọc cao su chống trầy xước sàn nhà.",
    specs: {
      "Chất liệu": "Khung sắt hộp sơn tĩnh điện, Đợt gỗ chống nước",
      "Màu sắc": "Khung đen, Gỗ óc chó",
      "Kích thước": "80 x 35 x 140 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 42,
    name: "Tủ Quần Áo Gỗ Sồi 2 Cánh Mở Sang Trọng",
    category: "Storage",
    categoryName: "Lưu trữ",
    price: 4850000,
    oldPrice: 5500000,
    stock: 10,
    status: "In stock",
    badge: "Hot",
    badgeType: "badge-new",
    image: "assets/images/products/do-noi-that/tu-ke-5.jpg",
    description: "Tủ áo gỗ sồi tự nhiên 2 cánh lớn tích hợp thanh treo trang phục và kệ gấp đồ.",
    fullDesc: "Tủ Quần Áo Gỗ Sồi 2 Cánh Mở Sang Trọng gỗ dày dặn, bản lề chốt âm chống kẹt tay.",
    specs: {
      "Chất liệu": "Gỗ sồi tự nhiên nguyên khối",
      "Màu sắc": "Gỗ mộc ấm cúng",
      "Kích thước": "120 x 58 x 200 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  // --- TỦ LAVABO ---
  {
    id: 43,
    name: "Tủ Lavabo Phòng Tắm Gỗ Chống Nước",
    category: "Lavabo",
    categoryName: "Tủ lavabo",
    price: 3250000,
    oldPrice: 3800000,
    stock: 18,
    status: "In stock",
    badge: "Mới",
    badgeType: "badge-new",
    image: "assets/images/products/do-noi-that/tu-lavabo-1.jpg",
    description: "Tủ chậu rửa lavabo chất liệu PVC chống nước tuyệt đối cho phòng tắm hiện đại.",
    fullDesc: "Tủ Lavabo Phòng Tắm Gỗ Chống Nước kèm chậu sứ tráng men Nano chống bám bẩn.",
    specs: {
      "Chất liệu": "Tấm nhựa PVC cao cấp, Chậu sứ nano",
      "Màu sắc": "Trắng tinh phối Gỗ",
      "Kích thước": "70 x 48 x 50 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 44,
    name: "Bộ Tủ Lavabo Treo Tường Kèm Gương Đèn LED",
    category: "Lavabo",
    categoryName: "Tủ lavabo",
    price: 4190000,
    oldPrice: 4900000,
    stock: 14,
    status: "In stock",
    badge: "-14%",
    badgeType: "badge-sale",
    image: "assets/images/products/do-noi-that/tu-lavabo-2.jpg",
    description: "Bộ tủ chậu treo tường hiện đại đi kèm gương soi cảm ứng tích hợp đèn LED sấy mờ.",
    fullDesc: "Bộ Tủ Lavabo Treo Tường Kèm Gương Đèn LED nâng tầm đẳng cấp tiện nghi cho phòng tắm gia đình.",
    specs: {
      "Chất liệu": "Nhựa PVC chống nước, Gương phôi Bỉ 5mm",
      "Màu sắc": "Ghi xám nhám, Đèn LED cảm ứng",
      "Kích thước": "80 x 50 x 52 cm",
      "Xuất xứ": "Nhập khẩu"
    }
  },
  {
    id: 45,
    name: "Tủ Lavabo Nhôm Nôi Tấm Chống Ẩm Mốc",
    category: "Lavabo",
    categoryName: "Tủ lavabo",
    price: 2990000,
    oldPrice: 3500000,
    stock: 20,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/do-noi-that/tu-lavabo-3.jpg",
    description: "Tủ lavabo làm từ hợp kim nhôm siêu nhẹ, không rỉ sét không sợ mối mọt.",
    fullDesc: "Tủ Lavabo Nhôm Nôi Tấm Chống Ẩm Mốc giữ độ bền đẹp sáng bóng theo thời gian.",
    specs: {
      "Chất liệu": "Hợp kim nhôm tấm, Chậu âm bàn",
      "Màu sắc": "Đen mờ hiện đại",
      "Kích thước": "60 x 47 x 48 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 46,
    name: "Bộ Tủ Lavabo Tân Cổ Điển Sang Trọng",
    category: "Lavabo",
    categoryName: "Tủ lavabo",
    price: 5350000,
    oldPrice: 6100000,
    stock: 9,
    status: "In stock",
    badge: "Hot",
    badgeType: "badge-new",
    image: "assets/images/products/do-noi-that/tu-lavabo-4.jpg",
    description: "Tủ chậu rửa hoa văn tân cổ điển tinh tế cho biệt thự và chung cư cao cấp.",
    fullDesc: "Bộ Tủ Lavabo Tân Cổ Điển Sang Trọng chân tủ đứng vững chãi, tay nắm hợp kim đồng cổ.",
    specs: {
      "Chất liệu": "Gỗ tràm chống ẩm phủ sơn 5 lớp, Chậu dương vành",
      "Màu sắc": "Trắng ngà viền kim loại",
      "Kích thước": "90 x 52 x 82 cm",
      "Xuất xứ": "Việt Nam"
    }
  },
  {
    id: 47,
    name: "Tủ Lavabo Đôi Đổi Màu Cao Cấp",
    category: "Lavabo",
    categoryName: "Tủ lavabo",
    price: 5990000,
    oldPrice: 6800000,
    stock: 7,
    status: "In stock",
    badge: null,
    badgeType: null,
    image: "assets/images/products/do-noi-that/tu-lavabo-5.jpg",
    description: "Tủ lavabo 2 chậu rửa sinh hoạt tiện lợi cho vợ chồng và gia đình đông người.",
    fullDesc: "Tủ Lavabo Đôi Đổi Màu Cao Cấp tích hợp mặt đá chống thấm nước xước xát tối ưu.",
    specs: {
      "Chất liệu": "Khung PVC lõi đặc, Mặt đá nhân tạo 2 chậu",
      "Màu sắc": "Vân mây xám",
      "Kích thước": "120 x 50 x 50 cm",
      "Xuất xứ": "Việt Nam"
    }
  }
];
