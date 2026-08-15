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
  }
];
