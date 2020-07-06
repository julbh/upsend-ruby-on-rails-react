import { FileChecksum } from "activestorage/src/file_checksum";
import { BlobUpload } from "activestorage/src/blob_upload";

function calculateChecksum(file) {
  return new Promise((resolve, reject) => {
    FileChecksum.create(file, (error, checksum) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(checksum);
    });
  });
}


export const getFileMetadata = (file) => {
  return new Promise((resolve) => {
    calculateChecksum(file).then((checksum) => {
      resolve({
        checksum,
        filename: file.name,
        contentType: file.type,
        byteSize: file.size
      });    
    });
  });
};


export const directUpload = (url, headers, file) => {
  const upload = new BlobUpload({ file, directUploadData: { url, headers } });
  return new Promise((resolve, reject) => {
    upload.create(error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    })
  });
};





export const directUploadWithProgress = (url, headers, file, updateProgress) => {

  const directUploadWillStoreFileWithXHR = (request) => { 
    request.upload.addEventListener("progress", event => updateProgress(event), false)
  }

  const upload = new BlobUploadWithProgress({ file, directUploadData: { url, headers } }, directUploadWillStoreFileWithXHR);

  return new Promise((resolve, reject) => { 

    upload.create(error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    })
  });
}


export class BlobUploadWithProgress {
  constructor(blob,delegate) {
    this.blob = blob
    this.file = blob.file

    const { url, headers } = blob.directUploadData

    this.xhr = new XMLHttpRequest
    this.xhr.open("PUT", url, true)
    this.xhr.responseType = "text"
    for (const key in headers) {
      this.xhr.setRequestHeader(key, headers[key])
    }
    this.xhr.addEventListener("load", event => this.requestDidLoad(event))
    this.xhr.addEventListener("error", event => this.requestDidError(event))
    //this.xhr.upload.addEventListener("progress", event => this.requestProgress(event), false)
    
    this.delegate = delegate
  }

  delegateMe(callback){
    this.delegate = callback;
  }
  create(callback) { 
    this.callback = callback
    //notify(this.delegate, this.xhr)
    notify(this.delegate, this.xhr)
    this.xhr.send(this.file.slice())
  }

  requestDidLoad(event) {
    const { status, response } = this.xhr
    if (status >= 200 && status < 300) {
      this.callback(null, response)
    } else {
      this.requestDidError(event)
    }
  }

  requestDidError(event) {
    this.callback(`Error storing "${this.file.name}". Status: ${this.xhr.status}`)
  }

  requestProgress(event) {
    //console.log("BlobUploadWithProgress Progress", event) 
  }
}
// function notify(object, methodName, ...messages) {
//   if (object && typeof object[methodName] == "function") {
//     return object[methodName](...messages)
//   }
// }
function notify(methodName, ...messages) { 
    return methodName(...messages) 
}
