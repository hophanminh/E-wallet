const transactionImagesModel = require('../../models/transactionImagesModel');
const { v4: uuidv4 } = require('uuid');
const config = require("../../config/default.json");
const cloudinary = require('cloudinary').v2;
cloudinary.config(config.CLOUDINARY);
module.exports = function (socket, decoded_userID) {

  // get image from 1 transaction
  socket.on('get_transaction_image', async ({ TransactionID }, callback) => {
    try {
      const imageList = await transactionImagesModel.getImageByTransactionID(TransactionID);
      callback({ imageList });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on('add_transaction_image', ({ transactionID, urls }) => {
    console.log('thêm ảnh mới');
    socket.broadcast.emit(`wait_for_add_transaction_image_${transactionID}`, { urls });
  });

  socket.on('remove_transaction_image', async (data, callback) => {
    const { imageID, transactionID } = data;

    console.log(imageID);
    try {
      const images = await transactionImagesModel.getImageByID(imageID);

      if (images.length !== 1) {
        throw new Error('Image not found by given id');
      }

      const removed = await cloudinary.uploader.destroy(images[0].PublicID);

      if (removed.result !== 'ok') {
        throw new Error('given public id is incorrect');
      }

      await transactionImagesModel.deleteImage(imageID);
      callback(200);
      socket.broadcast.emit(`wait_for_remove_transaction_image_${transactionID}`, { imageID });
    } catch (err) {
      console.log(err);
      callback(500);
    }
  });
};
