import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
export const fileUpload = (fieldName) => {
	// console.log(fieldName);
	const upload = multer({ storage: multer.memoryStorage() });
	return upload.single(fieldName);
};
