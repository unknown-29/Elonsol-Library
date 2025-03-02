import mongoose from 'mongoose';

const bookSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
		},
		category: {
			type: String,
			required: true,
		},
		cover: {
			type: String,
			required: true,
		},
		downloadUrl: {
			type: String,
		},
		fileSize: {
			type: String,
		},
	},

	{ timestamps: true }
);

const bookModel = mongoose.model('book', bookSchema);

export default bookModel;
