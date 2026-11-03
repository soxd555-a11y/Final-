/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* รายการหนังสือ (ค้นหา กรอง เรียง แบ่งหน้า)
*
* q String ค้นหาชื่อ/ผู้แต่ง/ISBN (optional)
* catalogUnderscoreid Integer  (optional)
* page Integer  (optional)
* limit Integer  (optional)
* sort String  (optional)
* order String  (optional)
* returns _api_books_get_200_response
* */
const apiBooksGET = ({ q, catalogUnderscoreid, page, limit, sort, order }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        q,
        catalogUnderscoreid,
        page,
        limit,
        sort,
        order,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* ลบหนังสือ (ลบไฟล์ปกด้วย)
*
* id Integer 
* no response value expected for this operation
* */
const apiBooksIdDELETE = ({ id }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        id,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* ดูหนังสือตาม id
*
* id Integer 
* returns _api_books__id__get_200_response
* */
const apiBooksIdGET = ({ id }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        id,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* แก้ไขหนังสือ (ไม่ส่ง cover = ใช้รูปเดิม)
*
* id Integer 
* title String 
* author String 
* price BigDecimal 
* catalogUnderscoreid Integer 
* isbn String  (optional)
* publishUnderscoreyear Integer  (optional)
* cover File ไฟล์ jpg/png/webp ไม่เกิน 2MB (optional)
* no response value expected for this operation
* */
const apiBooksIdPUT = ({ id, title, author, price, catalogUnderscoreid, isbn, publishUnderscoreyear, cover }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        id,
        title,
        author,
        price,
        catalogUnderscoreid,
        isbn,
        publishUnderscoreyear,
        cover,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* เพิ่มหนังสือ (อัปโหลดปกได้)
*
* title String 
* author String 
* price BigDecimal 
* catalogUnderscoreid Integer 
* isbn String  (optional)
* publishUnderscoreyear Integer  (optional)
* cover File ไฟล์ jpg/png/webp ไม่เกิน 2MB (optional)
* no response value expected for this operation
* */
const apiBooksPOST = ({ title, author, price, catalogUnderscoreid, isbn, publishUnderscoreyear, cover }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        title,
        author,
        price,
        catalogUnderscoreid,
        isbn,
        publishUnderscoreyear,
        cover,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

module.exports = {
  apiBooksGET,
  apiBooksIdDELETE,
  apiBooksIdGET,
  apiBooksIdPUT,
  apiBooksPOST,
};
