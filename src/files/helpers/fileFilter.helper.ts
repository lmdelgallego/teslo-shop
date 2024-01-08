export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  console.log('FileFilter', { file });
  if (!file) return callback(new Error('File is empty'), false);

  const fileExtension = file.mimetype.split('/').pop();
  const valideExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  console.log(valideExtensions.includes(fileExtension));
  if (valideExtensions.includes(fileExtension)) return callback(null, true);

  // const allowedMimes = ['image/jpeg', 'image/png'];
  // if (!allowedMimes.includes(file.mimetype))
  //   return callback(new Error('File type not allowed'), false);

  callback(null, false);
};
