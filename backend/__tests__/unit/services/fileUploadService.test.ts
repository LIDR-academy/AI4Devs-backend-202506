import * as fileUploadService from '../../../src/application/services/fileUploadService';

describe('fileUploadService', () => {
  let req: any;
  let res: any;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    req = { file: null };
    res = { status: statusMock, json: jsonMock };
  });

  it('should upload PDF file successfully', done => {
    req.file = { path: 'uploads/test.pdf', mimetype: 'application/pdf' };
    const uploader = jest.fn((req: any, res: any, cb: any) => cb(null));
    Object.defineProperty(fileUploadService, 'upload', { value: { single: () => uploader }, writable: true });
    fileUploadService.uploadFile(req, res);
    setImmediate(() => {
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ filePath: 'uploads/test.pdf', fileType: 'application/pdf' });
      done();
    });
  });

  it('should upload DOCX file successfully', done => {
    req.file = { path: 'uploads/test.docx', mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
    const uploader = jest.fn((req: any, res: any, cb: any) => cb(null));
    Object.defineProperty(fileUploadService, 'upload', { value: { single: () => uploader }, writable: true });
    fileUploadService.uploadFile(req, res);
    setImmediate(() => {
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ filePath: 'uploads/test.docx', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      done();
    });
  });

  it('should reject file with invalid type', done => {
    req.file = null;
    const uploader = jest.fn((req: any, res: any, cb: any) => cb(null));
    Object.defineProperty(fileUploadService, 'upload', { value: { single: () => uploader }, writable: true });
    fileUploadService.uploadFile(req, res);
    setImmediate(() => {
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid file type, only PDF and DOCX are allowed!' });
      done();
    });
  });

  it('should handle MulterError', done => {
    class MulterError extends Error { constructor(message: string) { super(message); this.name = 'MulterError'; } }
    const multerError = new MulterError('LIMIT_FILE_SIZE');
    const uploader = jest.fn((req: any, res: any, cb: any) => cb(multerError));
    Object.defineProperty(fileUploadService, 'upload', { value: { single: () => uploader }, writable: true });
    fileUploadService.uploadFile(req, res);
    setImmediate(() => {
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: multerError.message });
      done();
    });
  });

  it('should handle generic error', done => {
    const genericError = new Error('Some error');
    const uploader = jest.fn((req: any, res: any, cb: any) => cb(genericError));
    Object.defineProperty(fileUploadService, 'upload', { value: { single: () => uploader }, writable: true });
    fileUploadService.uploadFile(req, res);
    setImmediate(() => {
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: genericError.message });
      done();
    });
  });
}); 