const ProductCategory = require('../models/ProductCategory');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');

// Lấy danh sách danh mục
const getCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.find();
    successResponse(res, categories);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy danh sách danh mục', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Lấy thông tin danh mục theo ID
const getCategoryById = async (req, res) => {
  try {
    const category = await ProductCategory.findById(req.params.categoryId);
    if (!category) {
      return errorResponse(res, 'Không tìm thấy danh mục', HTTP_STATUS.NOT_FOUND);
    }
    successResponse(res, category);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy thông tin danh mục', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Tạo danh mục mới
const createCategory = async (req, res) => {
  try {
    const { Category_Name, Description } = req.body;

    // Kiểm tra danh mục đã tồn tại
    const existingCategory = await ProductCategory.findOne({ Category_Name });
    if (existingCategory) {
      return errorResponse(res, 'Tên danh mục đã tồn tại', HTTP_STATUS.BAD_REQUEST);
    }

    const category = new ProductCategory({
      Category_Name,
      Description
    });

    await category.save();
    successResponse(res, category, 'Tạo danh mục thành công', HTTP_STATUS.CREATED);
  } catch (error) {
    errorResponse(res, 'Lỗi tạo danh mục', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Cập nhật danh mục
const updateCategory = async (req, res) => {
  try {
    const { Category_Name, Description } = req.body;
    const category = await ProductCategory.findById(req.params.categoryId);

    if (!category) {
      return errorResponse(res, 'Không tìm thấy danh mục', HTTP_STATUS.NOT_FOUND);
    }

    // Kiểm tra tên danh mục mới có bị trùng không
    if (Category_Name && Category_Name !== category.Category_Name) {
      const existingCategory = await ProductCategory.findOne({ Category_Name });
      if (existingCategory) {
        return errorResponse(res, 'Tên danh mục đã tồn tại', HTTP_STATUS.BAD_REQUEST);
      }
    }

    // Cập nhật thông tin
    if (Category_Name) category.Category_Name = Category_Name;
    if (Description) category.Description = Description;

    await category.save();
    successResponse(res, category, 'Cập nhật danh mục thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi cập nhật danh mục', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Xóa danh mục
const deleteCategory = async (req, res) => {
  try {
    const category = await ProductCategory.findByIdAndDelete(req.params.categoryId);
    if (!category) {
      return errorResponse(res, 'Không tìm thấy danh mục', HTTP_STATUS.NOT_FOUND);
    }
    successResponse(res, null, 'Xóa danh mục thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi xóa danh mục', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
}; 