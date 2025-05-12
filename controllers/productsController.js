const Product = require('../models/Product');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');
const { cloudinary } = require('../config/cloudinary');

// Hàm helper để xóa ảnh từ Cloudinary
const deleteImageFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

// Lấy danh sách sản phẩm
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('CategoryID', 'Category_Name')
      .sort({ createdAt: -1 });
    successResponse(res, products);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy danh sách sản phẩm', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Lấy thông tin sản phẩm theo ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate('CategoryID', 'Category_Name');
    
    if (!product) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', HTTP_STATUS.NOT_FOUND);
    }
    successResponse(res, product);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy thông tin sản phẩm', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Tạo sản phẩm mới
const createProduct = async (req, res) => {
  try {
    const {
      Product_Name,
      CategoryID,
      Description,
      Price,
      Specifications,
      Stock
    } = req.body;

    // Kiểm tra file upload
    if (!req.files || !req.files.Main_Image) {
      return errorResponse(res, 'Hình ảnh chính là bắt buộc', HTTP_STATUS.BAD_REQUEST);
    }

    // Upload hình ảnh chính
    let mainImageUrl = '';
    if (req.files.Main_Image) {
      const result = await cloudinary.uploader.upload(req.files.Main_Image[0].buffer.toString('base64'), {
        folder: 'products/main',
        resource_type: 'image',
        format: 'jpg'
      });
      mainImageUrl = result.secure_url;
    }

    // Upload danh sách hình ảnh
    let listImages = [];
    if (req.files.List_Image) {
      const uploadPromises = req.files.List_Image.map(file =>
        cloudinary.uploader.upload(file.buffer.toString('base64'), {
          folder: 'products/list',
          resource_type: 'image',
          format: 'jpg'
        })
      );
      const results = await Promise.all(uploadPromises);
      listImages = results.map(result => result.secure_url);
    }

    const product = new Product({
      Product_Name,
      CategoryID,
      Description,
      Price,
      Main_Image: mainImageUrl,
      List_Image: listImages,
      Specifications,
      Stock
    });

    await product.save();
    successResponse(res, product, 'Tạo sản phẩm thành công', HTTP_STATUS.CREATED);
  } catch (error) {
    errorResponse(res, 'Lỗi tạo sản phẩm', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
  try {
    const {
      Product_Name,
      CategoryID,
      Description,
      Price,
      Specifications,
      Stock
    } = req.body;

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', HTTP_STATUS.NOT_FOUND);
    }

    // Upload và xóa hình ảnh chính mới nếu có
    if (req.files && req.files.Main_Image) {
      // Xóa ảnh cũ
      await deleteImageFromCloudinary(product.Main_Image);
      
      // Upload ảnh mới
      const result = await cloudinary.uploader.upload(req.files.Main_Image[0].buffer.toString('base64'), {
        folder: 'products/main',
        resource_type: 'image',
        format: 'jpg'
      });
      product.Main_Image = result.secure_url;
    }

    // Upload và xóa danh sách hình ảnh mới nếu có
    if (req.files && req.files.List_Image) {
      // Xóa ảnh cũ
      await Promise.all(
        product.List_Image.map(imageUrl => deleteImageFromCloudinary(imageUrl))
      );
      
      // Upload ảnh mới
      const uploadPromises = req.files.List_Image.map(file =>
        cloudinary.uploader.upload(file.buffer.toString('base64'), {
          folder: 'products/list',
          resource_type: 'image',
          format: 'jpg'
        })
      );
      const results = await Promise.all(uploadPromises);
      product.List_Image = results.map(result => result.secure_url);
    }

    // Cập nhật thông tin
    if (Product_Name) product.Product_Name = Product_Name;
    if (CategoryID) product.CategoryID = CategoryID;
    if (Description) product.Description = Description;
    if (Price) product.Price = Price;
    if (Specifications) product.Specifications = Specifications;
    if (Stock !== undefined) product.Stock = Stock;

    await product.save();
    successResponse(res, product, 'Cập nhật sản phẩm thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi cập nhật sản phẩm', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', HTTP_STATUS.NOT_FOUND);
    }

    // Xóa hình ảnh từ Cloudinary
    await deleteImageFromCloudinary(product.Main_Image);
    if (product.List_Image && product.List_Image.length > 0) {
      await Promise.all(
        product.List_Image.map(imageUrl => deleteImageFromCloudinary(imageUrl))
      );
    }

    successResponse(res, null, 'Xóa sản phẩm thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi xóa sản phẩm', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Lấy sản phẩm theo danh mục
const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ CategoryID: req.params.categoryId })
      .populate('CategoryID', 'Category_Name')
      .sort({ createdAt: -1 });
    successResponse(res, products);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy sản phẩm theo danh mục', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory
}; 