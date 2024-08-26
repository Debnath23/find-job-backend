"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadOnCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const fs = require("fs");
cloudinary_1.v2.config({
    cloud_name: 'dnljaiskr',
    api_key: '287677496845536',
    api_secret: '94Heu92e9yOWYTwh8XFMoAuAtoA',
});
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath)
            return null;
        const response = await cloudinary_1.v2.uploader.upload(localFilePath, {
            resource_type: 'auto',
        });
        fs.unlinkSync(localFilePath);
        return response;
    }
    catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
};
exports.uploadOnCloudinary = uploadOnCloudinary;
const deleteFromCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath)
            return null;
        await cloudinary_1.v2.uploader.destroy(localFilePath);
    }
    catch (error) {
        return null;
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
//# sourceMappingURL=cloudinary.js.map