// --- KHAI BÁO BIẾN TRẠNG THÁI (STATE) ---
let allProducts = [];       // Chứa toàn bộ dữ liệu từ API
let currentProducts = [];   // Chứa dữ liệu sau khi lọc/sort để hiển thị
let currentPage = 1;        // Trang hiện tại
let itemsPerPage = 10;      // Số dòng mỗi trang (mặc định 10)

// --- 1. HÀM GET ALL (FETCH API) ---
async function getAllProducts() {
    try {
        const response = await fetch('https://api.escuelajs.co/api/v1/products');
        const data = await response.json();
        
        // Lưu dữ liệu gốc
        allProducts = data;
        // Gán dữ liệu hiện tại bằng dữ liệu gốc (ban đầu chưa lọc)
        currentProducts = [...allProducts];
        
        // Render trang đầu tiên
        renderTable();
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        alert("Không thể tải dữ liệu từ API");
    }
}

// --- 2. HÀM RENDER BẢNG (HIỂN THỊ DỮ LIỆU) ---
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Xóa dữ liệu cũ

    // Tính toán vị trí cắt mảng cho phân trang
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToShow = currentProducts.slice(startIndex, endIndex);

    // Duyệt qua từng sản phẩm và tạo hàng (row)
    productsToShow.forEach(product => {
        // Xử lý hình ảnh: lấy hình đầu tiên, nếu lỗi thì dùng ảnh placeholder
        let imageUrl = "https://via.placeholder.com/150";
        if (product.images && product.images.length > 0) {
             // Clean URL (API này đôi khi trả về string JSON phức tạp)
             let cleanUrl = product.images[0].replace(/[\[\]"]/g, ''); 
             if(cleanUrl.startsWith('http')) imageUrl = cleanUrl;
        }

        const row = `
            <tr>
                <td>${product.id}</td>
                <td><img src="${imageUrl}" alt="${product.title}" class="product-img" onerror="this.src='https://via.placeholder.com/80'"></td>
                <td>${product.title}</td>
                <td>$${product.price}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    // Cập nhật trạng thái nút phân trang
    updatePaginationControls();
}

// --- 3. TÌM KIẾM (ONCHANGE / ONINPUT) ---
function handleSearch(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    
    // Lọc từ danh sách gốc (allProducts)
    currentProducts = allProducts.filter(product => 
        product.title.toLowerCase().includes(lowerKeyword)
    );

    // Reset về trang 1 sau khi tìm kiếm
    currentPage = 1;
    // Sắp xếp lại nếu đang có chế độ sắp xếp (tuỳ chọn, ở đây ta render luôn)
    const sortValue = document.getElementById('sortSelect').value;
    if(sortValue !== 'default') {
        handleSort(sortValue); // Gọi lại hàm sort để áp dụng lên kết quả tìm kiếm
    } else {
        renderTable();
    }
}

// --- 4. SẮP XẾP (TĂNG/GIẢM GIÁ & TÊN) ---
function handleSort(sortType) {
    // sortType nhận giá trị: price_asc, price_desc, name_asc, name_desc
    
    switch (sortType) {
        case 'price_asc':
            currentProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            currentProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name_asc':
            currentProducts.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'name_desc':
            currentProducts.sort((a, b) => b.title.localeCompare(a.title));
            break;
        default:
            // Nếu chọn mặc định thì không sort lại mảng hiện tại (hoặc reset theo ID nếu muốn)
            break;
    }
    
    renderTable();
}

// --- 5. PHÂN TRANG & THAY ĐỔI SỐ LƯỢNG ---
function changePageSize(size) {
    itemsPerPage = parseInt(size);
    currentPage = 1; // Reset về trang 1 khi đổi số lượng hiển thị
    renderTable();
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

function updatePaginationControls() {
    const pageInfo = document.getElementById('pageInfo');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const totalPages = Math.ceil(currentProducts.length / itemsPerPage) || 1;

    pageInfo.innerText = `Trang ${currentPage} / ${totalPages}`;
    
    // Disable nút nếu ở đầu hoặc cuối
    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage === totalPages;
}

// --- KHỞI CHẠY ỨNG DỤNG ---
// Gọi hàm lấy dữ liệu khi trang web tải xong
document.addEventListener('DOMContentLoaded', getAllProducts);